<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Api\RecitationController;
use App\Http\Controllers\Api\ReciterController;
use App\Http\Controllers\Api\SurahController;
use App\Http\Controllers\Api\VerseController;
use App\Http\Controllers\Api\AdhkarController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DiseaseController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\FeatureFlagController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RecordingController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SponsorController;
use App\Http\Controllers\Api\SubcategoryController;
use App\Http\Controllers\Api\TahsinatController;

// ── Auth credential routes — strict per-IP brute-force protection ─────────────
Route::middleware(['throttle:auth'])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/auth/google/callback', [GoogleAuthController::class, 'handleMobileGoogleCallback']);
});

// ── OTP verification — separate throttle ──────────────────────────────────────
Route::middleware(['throttle:otp'])->group(function () {
    Route::post('/auth/verify-otp', [GoogleAuthController::class, 'verifyOtp']);
    Route::post('/auth/resend-otp', [GoogleAuthController::class, 'resendOtp']);
});

// ── OAuth one-time session exchange (existing-user login, no OTP) ──────────────
Route::middleware(['throttle:auth'])->group(function () {
    Route::post('/auth/session-exchange', [GoogleAuthController::class, 'exchangeSession']);
});

Route::middleware(['throttle:api'])->group(function () {

    // ── Mushaf (Quran) ────────────────────────────────────────────
    Route::get('/surahs', [SurahController::class, 'index']);
    Route::get('/surahs/{id}', [SurahController::class, 'show']);
    Route::get('/surahs/{surahId}/recitations', [RecitationController::class, 'bySurah']);
    Route::get('/verses/search', [VerseController::class, 'search']);
    Route::get('/reciters', [ReciterController::class, 'index']);
    Route::get('/reciters/{id}', [ReciterController::class, 'show']);
    Route::get('/recitations/{id}/audio', [RecitationController::class, 'audio']);
    Route::get('/recitations/{id}/download', [RecitationController::class, 'download']);

    // ── Hospital (Categories / Diseases / Recordings) ─────────────
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    Route::get('/subcategories/{slug}', [SubcategoryController::class, 'show']);
    Route::get('/diseases', [DiseaseController::class, 'index']);
    Route::get('/diseases/search', [DiseaseController::class, 'search']);
    Route::get('/general-ruqyah', [RecordingController::class, 'general']);
    Route::get('/diseases/{slug}', [DiseaseController::class, 'show']);
    Route::get('/recordings', [RecordingController::class, 'index']);
    Route::get('/recordings/{id}/stream', [RecordingController::class, 'stream']);
    // Gated audio stream — subscription/trial enforced server-side; serves the private file.
    Route::get('/recordings/{id}/audio', [RecordingController::class, 'audio']);
    Route::post('/recordings/{id}/play', [RecordingController::class, 'play']);

    // ── Adhkar ────────────────────────────────────────────────────
    Route::get('/adhkar/categories', [AdhkarController::class, 'categories']);
    Route::get('/adhkar/categories/{slug}/items', [AdhkarController::class, 'items']);
    Route::get('/adhkar/today', [AdhkarController::class, 'today']);
    Route::get('/adhkar/waking', [AdhkarController::class, 'waking']);

    // ── Tahsinat ──────────────────────────────────────────────────
    Route::get('/tahsinat/categories', [TahsinatController::class, 'categories']);
    Route::get('/tahsinat/categories/{slug}/items', [TahsinatController::class, 'items']);

    // ── Content ───────────────────────────────────────────────────
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/sponsors', [SponsorController::class, 'index']);
    Route::get('/sponsor-screen', [SponsorController::class, 'screen']);
    Route::get('/features', [FeatureFlagController::class, 'index']);

    // Bug reports & improvement suggestions. Public so guests can submit too;
    // the report is attributed to the user automatically when a token is sent.
    Route::post('/reports', [ReportController::class, 'store']);

    // ── Authenticated user routes ─────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/me', [AuthController::class, 'updateProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::delete('/account', [AuthController::class, 'deleteAccount']);

        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);
        Route::get('/favorites/nodes', [FavoriteController::class, 'nodes']);
        Route::post('/favorites/nodes/toggle', [FavoriteController::class, 'toggleNode']);

        Route::post('/feedback', [FeedbackController::class, 'store']);

        Route::get('/notifications/preferences', [NotificationController::class, 'preferences']);
        Route::post('/notifications/preferences', [NotificationController::class, 'updatePreferences']);
        Route::post('/notifications/token', [NotificationController::class, 'registerToken']);
    });
});
