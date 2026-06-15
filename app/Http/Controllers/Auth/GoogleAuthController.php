<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use App\Models\OAuthProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use App\Mail\OtpVerificationMail;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        $provider = Socialite::driver('google');
        assert($provider instanceof \Laravel\Socialite\Two\AbstractProvider);
        return $provider->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        $provider = Socialite::driver('google');
        assert($provider instanceof \Laravel\Socialite\Two\AbstractProvider);
        $googleUser = $provider->stateless()->user();
        assert($googleUser instanceof \Laravel\Socialite\Two\User);

        DB::beginTransaction();
        try {
            $oauthProvider = OAuthProvider::where('provider', 'google')
                ->where('provider_user_id', $googleUser->getId())
                ->first();

            if ($oauthProvider) {
                $user = $oauthProvider->user;
            } else {
                $user = User::where('email', $googleUser->getEmail())->first();
                if (!$user) {
                    $user = User::create([
                        'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Google User',
                        'email' => $googleUser->getEmail(),
                        'email_verified_at' => now(),
                        'password' => bcrypt(Str::random(32)),
                    ]);
                }
                $user->oauthProviders()->create([
                    'provider' => 'google',
                    'provider_user_id' => $googleUser->getId(),
                    'provider_token' => $googleUser->token,
                    'provider_refresh_token' => $googleUser->refreshToken ?? null,
                ]);
            }
            DB::commit();
            Auth::login($user);
            return redirect('/admin');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect('/login')->with('error', 'Authentication failed: ' . $e->getMessage());
        }
    }

    public function handleMobileGoogleCallback(Request $request)
    {
        $request->validate([
            'code'           => 'required|string',
            'code_verifier'  => 'required|string',
        ]);

        try {
            $client = new \GuzzleHttp\Client(['verify' => false]);

            // Exchange PKCE authorization code for tokens server-side.
            $tokenResponse = $client->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'code'          => $request->input('code'),
                    'client_id'     => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'redirect_uri'  => config('services.google.redirect'),
                    'grant_type'    => 'authorization_code',
                    'code_verifier' => $request->input('code_verifier'),
                ],
            ]);

            $tokens      = json_decode($tokenResponse->getBody(), true);
            $accessToken = $tokens['access_token'];

            // Fetch user profile.
            $userInfoResponse = $client->get('https://www.googleapis.com/oauth2/v3/userinfo', [
                'headers' => ['Authorization' => 'Bearer ' . $accessToken],
            ]);

            $googleUser = json_decode($userInfoResponse->getBody(), true);

            // Existing Google account — log in directly.
            $oauthProvider = OAuthProvider::where('provider', 'google')
                ->where('provider_user_id', $googleUser['sub'])
                ->first();

            if ($oauthProvider) {
                $user = $oauthProvider->user;
                if ($user) {
                    $oauthProvider->update(['provider_token' => $accessToken]);
                    return response()->json([
                        'status' => 'success',
                        'user'   => $user,
                        'token'  => $user->createToken('mobile-app')->plainTextToken,
                    ]);
                }
                $oauthProvider->delete();
            }

            // Email registered via another method — link and log in.
            $existingUser = User::where('email', $googleUser['email'])->first();
            if ($existingUser) {
                $existingUser->oauthProviders()->create([
                    'provider'         => 'google',
                    'provider_user_id' => $googleUser['sub'],
                    'provider_token'   => $accessToken,
                ]);
                return response()->json([
                    'status' => 'success',
                    'user'   => $existingUser,
                    'token'  => $existingUser->createToken('mobile-app')->plainTextToken,
                ]);
            }

            // Brand-new user — generate OTP and ask for email verification.
            $otp   = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $email = $googleUser['email'];

            Cache::put("otp:{$email}", [
                'otp'            => Hash::make($otp),
                'google_sub'     => $googleUser['sub'],
                'google_token'   => $accessToken,
                'name'           => $googleUser['name'] ?? $googleUser['given_name'] ?? 'User',
                'email_verified' => $googleUser['email_verified'] ?? false,
            ], 600);

            Mail::to($email)->send(new OtpVerificationMail($otp));

            return response()->json([
                'status' => 'verification_required',
                'email'  => $email,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Authentication failed', 'message' => $e->getMessage()], 500);
        }
    }

    public function handleGoogleMobileWebCallback(Request $request)
    {
        $stateRaw     = $request->query('state', '');
        $sessionToken = base64_decode(strtr($stateRaw, '-_', '+/') . str_repeat('=', (4 - strlen($stateRaw) % 4) % 4));

        try {
            $driver = Socialite::driver('google');
            assert($driver instanceof \Laravel\Socialite\Two\AbstractProvider);
            $googleUser = $driver
                ->stateless()
                ->redirectUrl(config('services.google.mobile_redirect'))
                ->user();
            assert($googleUser instanceof \Laravel\Socialite\Two\User);
        } catch (\Exception $e) {
            return $this->callbackRedirect('error', $sessionToken);
        }

        // Existing Google account — log in directly.
        $oauthProvider = OAuthProvider::where('provider', 'google')
            ->where('provider_user_id', $googleUser->getId())
            ->first();

        if ($oauthProvider) {
            $user = $oauthProvider->user;
            if (! $user) {
                // Orphaned provider record — user was deleted. Clean up and treat as new user.
                $oauthProvider->delete();
            } else {
                $this->cacheExchangeResult($sessionToken, $user->fresh());
                return $this->callbackRedirect('success', $sessionToken);
            }
        }

        // Email registered via another method — link and log in.
        $existingUser = User::where('email', $googleUser->getEmail())->first();
        if ($existingUser) {
            $existingUser->oauthProviders()->create([
                'provider'         => 'google',
                'provider_user_id' => $googleUser->getId(),
                'provider_token'   => $googleUser->token,
            ]);
            if (! $existingUser->google_id) {
                $existingUser->update([
                    'google_id'   => $googleUser->getId(),
                    'avatar_path' => $existingUser->avatar_path ?? $googleUser->getAvatar(),
                ]);
            }
            $this->cacheExchangeResult($sessionToken, $existingUser->fresh());
            return $this->callbackRedirect('success', $sessionToken);
        }

        // Brand-new user — email an OTP and bounce back to the app for native entry.
        // We map session_token → email in the cache so verifyOtp can resolve the email
        // without it ever travelling through the deep link (no user data in URLs).
        $otp   = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $email = $googleUser->getEmail();

        Cache::put("otp:{$email}", [
            'otp'            => Hash::make($otp),
            'google_sub'     => $googleUser->getId(),
            'google_token'   => $googleUser->token,
            'name'           => $googleUser->getName() ?? 'User',
            'avatar_url'     => $googleUser->getAvatar(),
            'email_verified' => true,
        ], 600);
        Cache::put("otp_session:{$sessionToken}", $email, 600);

        Mail::to($email)->send(new OtpVerificationMail($otp));

        return $this->callbackRedirect('verification_required', $sessionToken);
    }

    /**
     * Hand control back to the mobile app via an HTML "bounce" page.
     *
     * We deliberately do NOT use a 302 `redirect()->away('quranicclinic://…')`: inside the
     * Android Chrome Custom Tab opened by `openAuthSessionAsync`, a server redirect to a
     * custom scheme is routinely dropped (ERR_UNKNOWN_URL_SCHEME) because there is no user
     * gesture. Instead we return a page that (1) auto-launches the app via JS and (2) shows
     * a tap button as a guaranteed fallback (a user tap always resolves a registered custom
     * scheme). Data rides in QUERY params — Android strips URL fragments off launched intents.
     * Only the status + opaque session_token leave the server — never the token or profile.
     */
    private function callbackRedirect(string $status, string $sessionToken)
    {
        $deepLink = 'quranicclinic://auth-callback?status=' . rawurlencode($status)
            . '&session_token=' . rawurlencode($sessionToken);

        $jsUrl   = json_encode($deepLink, JSON_UNESCAPED_SLASHES);
        $hrefUrl = htmlspecialchars($deepLink, ENT_QUOTES);

        $html = <<<HTML
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Quranic Clinic</title>
<style>
  body{font-family:-apple-system,"Segoe UI",Roboto,sans-serif;background:#135452;color:#fff;
       margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center}
  .card{padding:32px}
  .spinner{width:42px;height:42px;margin:0 auto 18px;border:4px solid rgba(255,255,255,.3);
       border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  p{font-size:15px;line-height:1.6;opacity:.95}
  .btn{display:inline-block;margin-top:24px;padding:14px 30px;background:#fff;color:#135452;
       border-radius:999px;text-decoration:none;font-weight:700;font-size:15px}
</style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <p>جارٍ العودة إلى التطبيق…<br>Returning to the app…</p>
    <a class="btn" href="{$hrefUrl}">العودة إلى التطبيق · Open the app</a>
  </div>
  <script>
    (function () {
      var url = {$jsUrl};
      function go(){ try { window.location.replace(url); } catch (e) { window.location.href = url; } }
      go();
      setTimeout(go, 500);
    })();
  </script>
</body>
</html>
HTML;

        return response($html, 200)->header('Content-Type', 'text/html; charset=utf-8');
    }

    /**
     * Stash a one-time login result keyed by session_token so the app can claim it with
     * a single POST /auth/session-exchange call (existing-user path — no OTP needed).
     */
    private function cacheExchangeResult(string $sessionToken, User $user): void
    {
        Cache::put("auth_exchange:{$sessionToken}", [
            'status' => 'success',
            'token'  => $user->createToken('mobile-app')->plainTextToken,
            'user'   => $user->only(['id', 'name', 'email', 'avatar_path']),
        ], 300);
    }

    /**
     * One-time exchange: the app trades a session_token (delivered via deep link after a
     * successful existing-user login) for its bearer token. The result is forgotten on
     * read — this is a single direct call, not a polling loop.
     */
    public function exchangeSession(Request $request)
    {
        $request->validate(['session_token' => 'required|string']);

        $key    = "auth_exchange:{$request->session_token}";
        $result = Cache::get($key);

        if (! $result) {
            return response()->json(['error' => 'session_expired'], 410);
        }

        Cache::forget($key);
        return response()->json($result);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'session_token' => 'required|string',
            'otp'           => 'required|string|size:6',
        ]);

        $email = Cache::get("otp_session:{$request->session_token}");
        if (! $email) {
            return response()->json(['error' => 'session_expired'], 410);
        }

        $cached = Cache::get("otp:{$email}");

        if (! $cached || ! Hash::check($request->otp, $cached['otp'])) {
            return response()->json(['error' => 'invalid_otp'], 422);
        }

        DB::beginTransaction();
        try {
            // Purge any soft-deleted account with this email first. A trashed row still
            // occupies the email's unique index, so without this the create() below throws
            // a unique-constraint violation — which surfaces to the user as a misleading
            // "code not correct" and, because the session result is never cached, leaves
            // the app stuck on the loading spinner. (Trashed rows come from Delete Account.)
            User::onlyTrashed()->where('email', $email)->get()->each(function ($trashed) {
                $trashed->oauthProviders()->forceDelete();
                $trashed->tokens()->delete();
                $trashed->forceDelete();
            });

            $user = User::create([
                'name'              => $cached['name'],
                'email'             => $email,
                'email_verified_at' => now(),
                'password'          => bcrypt(Str::random(32)),
                'google_id'         => $cached['google_sub'],
                'avatar_path'       => $cached['avatar_url'] ?? null,
            ]);

            $user->oauthProviders()->create([
                'provider'         => 'google',
                'provider_user_id' => $cached['google_sub'],
                'provider_token'   => $cached['google_token'],
            ]);

            $user->assignRole('user');

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Registration failed'], 500);
        }

        Cache::forget("otp:{$email}");
        Cache::forget("otp_resend:{$email}");
        Cache::forget("otp_session:{$request->session_token}");

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'user'   => $user->fresh(),
            'token'  => $token,
        ]);
    }

    public function resendOtp(Request $request)
    {
        $request->validate(['session_token' => 'required|string']);

        $email = Cache::get("otp_session:{$request->session_token}");
        if (! $email) {
            return response()->json(['error' => 'session_expired'], 410);
        }

        $cached = Cache::get("otp:{$email}");
        if (! $cached) {
            return response()->json(['error' => 'No pending verification for this email'], 422);
        }

        $resendKey   = "otp_resend:{$email}";
        $resendCount = Cache::get($resendKey, 0);
        if ($resendCount >= 3) {
            return response()->json(['error' => 'too_many_resend_attempts'], 429);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put("otp:{$email}", array_merge($cached, [
            'otp' => Hash::make($otp),
        ]), 600);

        Cache::put($resendKey, $resendCount + 1, 600);

        Mail::to($email)->send(new OtpVerificationMail($otp));

        return response()->json(['status' => 'sent']);
    }
}
