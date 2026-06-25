<?php

namespace App\Providers;

use App\Policies\ContentPolicy;
use App\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(\App\Providers\RepositoryServiceProvider::class);

        $this->applyRedisFallbacks();
    }

    public function boot(): void
    {
        $this->warnOnFileCacheInProduction();

        // Authenticated users are keyed by user ID (generous: supports 30 s polling from multiple screens).
        // Unauthenticated requests are keyed by IP with a tighter cap.
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(120)->by('u:' . $request->user()->id)
                : Limit::perMinute(30)->by($request->ip());
        });

        // Strict per-IP limit for login / register to prevent brute-force.
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // OTP verify / resend — 10 per minute per IP.
        RateLimiter::for('otp', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // Write operations on all content are admin-only; reads stay public.
        $contentModels = [
            \App\Models\Category::class,
            \App\Models\Subcategory::class,
            \App\Models\Disease::class,
            \App\Models\DiseaseAlias::class,
            \App\Models\Recording::class,
            \App\Models\Favorite::class,
            \App\Models\AdhkarCategory::class,
            \App\Models\AdhkarSection::class,
            \App\Models\AdhkarItem::class,
            \App\Models\TahsinatCategory::class,
            \App\Models\TahsinatItem::class,
            \App\Models\Course::class,
            \App\Models\Sponsor::class,
            \App\Models\SponsorScreenConfig::class,
            \App\Models\Feedback::class,
            \App\Models\FeatureFlag::class,
            \App\Models\Surah::class,
            \App\Models\Verse::class,
            \App\Models\Reciter::class,
            \App\Models\Recitation::class,
        ];

        foreach ($contentModels as $model) {
            Gate::policy($model, ContentPolicy::class);
        }

        Gate::policy(\App\Models\User::class, UserPolicy::class);
    }

    /**
     * If a redis driver is selected for cache/session/queue but the server is unreachable,
     * fall back to file/database so the app keeps serving. Runs only when a redis driver is
     * actually active, so the default database/file setup pays no cost.
     */
    private function applyRedisFallbacks(): void
    {
        if (! config('scalability.redis.auto_fallback', true)) {
            return;
        }

        $usesRedis = in_array('redis', [
            config('cache.default'),
            config('session.driver'),
            config('queue.default'),
        ], true);

        if (! $usesRedis) {
            return;
        }

        try {
            $this->app->make('redis')->connection()->ping();
        } catch (\Throwable $e) {
            if (config('cache.default') === 'redis')  { config(['cache.default' => 'file']); }
            if (config('session.driver') === 'redis') { config(['session.driver' => 'file']); }
            if (config('queue.default') === 'redis')  { config(['queue.default' => 'database']); }

            Log::warning('Redis unreachable — fell back to file/database drivers.', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /** Rate limiting and shared cache use the default cache store; file cache is per-node and slow. */
    private function warnOnFileCacheInProduction(): void
    {
        if (! config('scalability.cache.warn_file_driver_in_production', true)) {
            return;
        }

        if ($this->app->environment('production') && config('cache.default') === 'file') {
            Log::warning('CACHE_STORE=file in production — prefer redis or database for shared cache and accurate rate limiting.');
        }
    }
}
