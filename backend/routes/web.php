<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

// ── Mobile Google OAuth — session-polling flow ─────────────────────────────
// Step 1: mobile app opens this URL in a browser; we redirect to Google with session_token in state.
Route::get('/auth/google/mobile', function (Request $request) {
    $sessionToken = $request->query('session_token', '');
    $state        = rtrim(strtr(base64_encode($sessionToken), '+/', '-_'), '=');

    return Socialite::driver('google')
        ->stateless()
        ->redirectUrl(config('services.google.mobile_redirect'))
        ->with(['state' => $state])
        ->scopes(['openid', 'profile', 'email'])
        ->redirect();
});

// Step 2: Google redirects here; we store result in cache and show a "done" page.
Route::get('/auth/google/mobile/callback', [GoogleAuthController::class, 'handleGoogleMobileWebCallback']);
