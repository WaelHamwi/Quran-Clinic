<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthUserResource;
use App\Services\GoogleAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function __construct(private GoogleAuthService $service) {}

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

        try {
            $user = $this->service->loginOrCreateWebAdmin($googleUser);
            Auth::login($user);
            return redirect('/admin');
        } catch (\Exception $e) {
            Log::error('Google web callback failed', [
                'message'   => $e->getMessage(),
                'exception' => $e,
            ]);
            return redirect('/login')->with('error', 'Authentication failed. Please try again.');
        }
    }

    public function handleMobileGoogleCallback(Request $request)
    {
        $request->validate([
            'code'          => 'required|string',
            'code_verifier' => 'required|string',
        ]);

        try {
            $googleUser = $this->service
                ->exchangeCodeForProfile($request->input('code'), $request->input('code_verifier'));

            $result = $this->service->resolveMobileProfile($googleUser);

            if ($result['outcome'] === 'success') {
                return response()->json([
                    'status' => 'success',
                    'user'   => new AuthUserResource($result['user']),
                    'token'  => $result['token'],
                ]);
            }

            return response()->json([
                'status' => 'verification_required',
                'email'  => $result['email'],
            ]);
        } catch (\Exception $e) {
            Log::error('Google mobile callback failed', [
                'message'   => $e->getMessage(),
                'exception' => $e,
            ]);
            return response()->json(['error' => 'Authentication failed'], 500);
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

        $result = $this->service->resolveWebBounceProfile($googleUser, $sessionToken);

        return $this->callbackRedirect($result['outcome'], $sessionToken);
    }

    public function exchangeSession(Request $request)
    {
        $request->validate(['session_token' => 'required|string']);

        $result = $this->service->exchangeSession($request->input('session_token'));

        if (! $result) {
            return response()->json(['error' => 'session_expired'], 410);
        }

        return response()->json($result);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'session_token' => 'required|string',
            'otp'           => 'required|string|size:6',
        ]);

        $result = $this->service->verifyOtp($request->input('session_token'), $request->input('otp'));

        return match ($result['outcome']) {
            'success' => response()->json([
                'status' => 'success',
                'user'   => new AuthUserResource($result['user']),
                'token'  => $result['token'],
            ]),
            'session_expired'     => response()->json(['error' => 'session_expired'], 410),
            'too_many_attempts'   => response()->json(['error' => 'too_many_attempts'], 429),
            'invalid_otp'         => response()->json(['error' => 'invalid_otp'], 422),
            'registration_failed' => response()->json(['error' => 'Registration failed'], 500),
        };
    }

    public function resendOtp(Request $request)
    {
        $request->validate(['session_token' => 'required|string']);

        $result = $this->service->resendOtp($request->input('session_token'));

        return match ($result['outcome']) {
            'sent'            => response()->json(['status' => 'sent']),
            'session_expired' => response()->json(['error' => 'session_expired'], 410),
            'no_pending'      => response()->json(['error' => 'No pending verification for this email'], 422),
            'too_many_resend' => response()->json(['error' => 'too_many_resend_attempts'], 429),
        };
    }

    private function callbackRedirect(string $status, string $sessionToken)
    {
        $deepLink = 'quranicclinic://auth-callback?status=' . rawurlencode($status)
            . '&session_token=' . rawurlencode($sessionToken);

        return response()
            ->view('auth.google-callback', ['deepLink' => $deepLink], 200)
            ->header('Content-Type', 'text/html; charset=utf-8');
    }
}
