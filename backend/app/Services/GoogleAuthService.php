<?php

namespace App\Services;

use App\Mail\OtpVerificationMail;
use App\Models\OAuthProvider;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Socialite\Two\User as SocialiteUser;

class GoogleAuthService
{
    private const OTP_TTL = 600;

    private const EXCHANGE_TTL = 300;

    private const MAX_OTP_ATTEMPTS = 5;

    private const MAX_RESEND = 3;

    public function loginOrCreateWebAdmin(SocialiteUser $googleUser): User
    {
        return DB::transaction(function () use ($googleUser) {
            $oauthProvider = OAuthProvider::where('provider', 'google')
                ->where('provider_user_id', $googleUser->getId())
                ->first();

            if ($oauthProvider) {
                return $oauthProvider->user;
            }

            $user = User::where('email', $googleUser->getEmail())->first();
            if (! $user) {
                // forceFill so email_verified_at persists — create() silently
                // dropped it because it was never in the Fillable list.
                $user = (new User)->forceFill([
                    'name'              => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Google User',
                    'email'             => $googleUser->getEmail(),
                    'email_verified_at' => now(),
                    'password'          => bcrypt(Str::random(32)),
                ]);
                $user->save();
            }

            $user->oauthProviders()->create([
                'provider'         => 'google',
                'provider_user_id' => $googleUser->getId(),
            ]);

            return $user;
        });
    }

    public function exchangeCodeForProfile(string $code, string $codeVerifier): array
    {
        $client = new \GuzzleHttp\Client(['verify' => true]);

        $tokenResponse = $client->post('https://oauth2.googleapis.com/token', [
            'form_params' => [
                'code'          => $code,
                'client_id'     => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'redirect_uri'  => config('services.google.redirect'),
                'grant_type'    => 'authorization_code',
                'code_verifier' => $codeVerifier,
            ],
        ]);

        $accessToken = json_decode($tokenResponse->getBody(), true)['access_token'];

        $userInfoResponse = $client->get('https://www.googleapis.com/oauth2/v3/userinfo', [
            'headers' => ['Authorization' => 'Bearer ' . $accessToken],
        ]);

        return json_decode($userInfoResponse->getBody(), true);
    }

    public function resolveMobileProfile(array $googleUser): array
    {
        $oauthProvider = OAuthProvider::where('provider', 'google')
            ->where('provider_user_id', $googleUser['sub'])
            ->first();

        if ($oauthProvider) {
            $user = $oauthProvider->user;
            if ($user) {
                return $this->successResult($user);
            }
            $oauthProvider->delete();
        }

        $existingUser = User::where('email', $googleUser['email'])->first();
        if ($existingUser) {
            // Only auto-link onto an EXISTING account when Google itself has verified
            // the email — otherwise an attacker with an unverified Google email that
            // happens to match a victim's address could hijack that account. Don't
            // fall through to the OTP/create flow below either: that path assumes no
            // existing user and would crash on the email unique constraint.
            if ($googleUser['email_verified'] ?? false) {
                $existingUser->oauthProviders()->create([
                    'provider'         => 'google',
                    'provider_user_id' => $googleUser['sub'],
                ]);
                return $this->successResult($existingUser);
            }

            return ['outcome' => 'verification_required', 'email' => $googleUser['email']];
        }

        $email = $googleUser['email'];
        $this->issueOtp($email, [
            'google_sub'     => $googleUser['sub'],
            'name'           => $googleUser['name'] ?? $googleUser['given_name'] ?? 'User',
            'email_verified' => $googleUser['email_verified'] ?? false,
        ]);

        return ['outcome' => 'verification_required', 'email' => $email];
    }

    public function resolveWebBounceProfile(SocialiteUser $googleUser, string $sessionToken): array
    {
        $oauthProvider = OAuthProvider::where('provider', 'google')
            ->where('provider_user_id', $googleUser->getId())
            ->first();

        if ($oauthProvider) {
            $user = $oauthProvider->user;
            if (! $user) {
                $oauthProvider->delete();
            } else {
                $this->cacheExchangeResult($sessionToken, $user->fresh());
                return ['outcome' => 'success'];
            }
        }

        $existingUser = User::where('email', $googleUser->getEmail())->first();
        if ($existingUser) {
            $existingUser->oauthProviders()->create([
                'provider'         => 'google',
                'provider_user_id' => $googleUser->getId(),
            ]);
            if (! $existingUser->google_id) {
                // google_id is not mass assignable (overposting guard) — set explicitly.
                $existingUser->forceFill([
                    'google_id'   => $googleUser->getId(),
                    'avatar_path' => $existingUser->avatar_path ?? $googleUser->getAvatar(),
                ])->save();
            }
            $this->cacheExchangeResult($sessionToken, $existingUser->fresh());
            return ['outcome' => 'success'];
        }

        $email = $googleUser->getEmail();
        $this->issueOtp($email, [
            'google_sub'     => $googleUser->getId(),
            'name'           => $googleUser->getName() ?? 'User',
            'avatar_url'     => $googleUser->getAvatar(),
            'email_verified' => true,
        ]);
        Cache::put("otp_session:{$sessionToken}", $email, self::OTP_TTL);

        return ['outcome' => 'verification_required'];
    }

    public function exchangeSession(string $sessionToken): ?array
    {
        $key    = "auth_exchange:{$sessionToken}";
        $result = Cache::get($key);

        if (! $result) {
            return null;
        }

        Cache::forget($key);

        return $result;
    }

    public function verifyOtp(string $sessionToken, string $otp): array
    {
        $email = Cache::get("otp_session:{$sessionToken}");
        if (! $email) {
            return ['outcome' => 'session_expired'];
        }

        $attemptsKey = "otp_attempts:{$email}";
        if ((int) Cache::get($attemptsKey, 0) >= self::MAX_OTP_ATTEMPTS) {
            return ['outcome' => 'too_many_attempts'];
        }

        $cached = Cache::get("otp:{$email}");

        if (! $cached || ! Hash::check($otp, $cached['otp'])) {
            $attempts = (int) Cache::get($attemptsKey, 0) + 1;
            Cache::put($attemptsKey, $attempts, self::OTP_TTL);
            if ($attempts >= self::MAX_OTP_ATTEMPTS) {
                return ['outcome' => 'too_many_attempts'];
            }
            return ['outcome' => 'invalid_otp'];
        }

        try {
            $user = DB::transaction(function () use ($cached, $email) {
                User::onlyTrashed()->where('email', $email)->get()->each(function ($trashed) {
                    $trashed->oauthProviders()->forceDelete();
                    $trashed->tokens()->delete();
                    $trashed->forceDelete();
                });

                // forceFill: google_id is not mass assignable (overposting guard),
                // and email_verified_at never was — create() silently dropped it.
                $user = (new User)->forceFill([
                    'name'              => $cached['name'],
                    'email'             => $email,
                    'email_verified_at' => now(),
                    'password'          => bcrypt(Str::random(32)),
                    'google_id'         => $cached['google_sub'],
                    'avatar_path'       => $cached['avatar_url'] ?? null,
                ]);
                $user->save();

                $user->oauthProviders()->create([
                    'provider'         => 'google',
                    'provider_user_id' => $cached['google_sub'],
                ]);

                $user->assignRole('user');

                return $user;
            });
        } catch (\Exception $e) {
            Log::error('OTP registration failed', [
                'message'   => $e->getMessage(),
                'exception' => $e,
            ]);
            return ['outcome' => 'registration_failed'];
        }

        Cache::forget("otp:{$email}");
        Cache::forget("otp_resend:{$email}");
        Cache::forget("otp_attempts:{$email}");
        Cache::forget("otp_session:{$sessionToken}");

        return $this->successResult($user->fresh());
    }

    public function resendOtp(string $sessionToken): array
    {
        $email = Cache::get("otp_session:{$sessionToken}");
        if (! $email) {
            return ['outcome' => 'session_expired'];
        }

        $cached = Cache::get("otp:{$email}");
        if (! $cached) {
            return ['outcome' => 'no_pending'];
        }

        $resendKey   = "otp_resend:{$email}";
        $resendCount = Cache::get($resendKey, 0);
        if ($resendCount >= self::MAX_RESEND) {
            return ['outcome' => 'too_many_resend'];
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put("otp:{$email}", array_merge($cached, [
            'otp' => Hash::make($otp),
        ]), self::OTP_TTL);

        Cache::forget("otp_attempts:{$email}");

        Cache::put($resendKey, $resendCount + 1, self::OTP_TTL);

        Mail::to($email)->send(new OtpVerificationMail($otp));

        return ['outcome' => 'sent'];
    }

    private function successResult(User $user): array
    {
        return [
            'outcome' => 'success',
            'user'    => $user,
            'token'   => $user->issueApiToken('mobile-app'),
        ];
    }

    private function issueOtp(string $email, array $payload): void
    {
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put("otp:{$email}", array_merge(['otp' => Hash::make($otp)], $payload), self::OTP_TTL);

        Mail::to($email)->send(new OtpVerificationMail($otp));
    }

    private function cacheExchangeResult(string $sessionToken, User $user): void
    {
        Cache::put("auth_exchange:{$sessionToken}", [
            'status' => 'success',
            'token'  => $user->issueApiToken('mobile-app'),
            'user'   => $user->only(['id', 'name', 'email', 'avatar_path']),
        ], self::EXCHANGE_TTL);
    }
}
