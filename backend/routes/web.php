<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Api\RecordingController;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

// Admin-only recording audio preview for the Filament "Listen" action. Uses the web
// session (Filament guard); the controller asserts the admin role. Serves the same private
// file so admins can preview premium sessions without a subscription.
Route::get('/admin/recordings/{recording}/audio', [RecordingController::class, 'adminAudio'])
    ->middleware('auth')
    ->name('admin.recordings.audio');

// ── Mobile Google OAuth — session-polling flow ─────────────────────────────
// Step 1: mobile app opens this URL in a browser; we redirect to Google with session_token in state.
Route::middleware('throttle:web-oauth')->get('/auth/google/mobile', function (Request $request) {
    $sessionToken = $request->query('session_token', '');
    $state        = rtrim(strtr(base64_encode($sessionToken), '+/', '-_'), '=');

    $provider = Socialite::driver('google');
    assert($provider instanceof \Laravel\Socialite\Two\AbstractProvider);

    return $provider
        ->stateless()
        ->redirectUrl(config('services.google.mobile_redirect'))
        ->with(['state' => $state])
        ->scopes(['openid', 'profile', 'email'])
        ->redirect();
});

// Step 2: Google redirects here; we store result in cache and show a "done" page.
Route::middleware('throttle:web-oauth')->get('/auth/google/mobile/callback', [GoogleAuthController::class, 'handleGoogleMobileWebCallback']);
