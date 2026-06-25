<?php

return [

    'audio' => [

        // Storage strategy for recitation/recording audio.
        //   local → files on the server's public disk (default).
        //   cloud → CLOUD MIGRATION POINT: future S3/object-storage + signed CDN URLs.
        //           No cloud SDK is bundled yet; selecting 'cloud' currently behaves
        //           like 'local' until the signed-URL strategy is implemented.
        'driver' => env('AUDIO_DRIVER', 'local'),

        // When true, local audio is handed to Nginx via an X-Accel-Redirect header so the
        // PHP-FPM worker is released immediately instead of streaming bytes itself. Requires
        // the matching internal `location` in the Nginx server block (see DEPLOYMENT.md).
        // Default false so `php artisan serve` / non-Nginx dev keeps using response()->file().
        'use_x_accel' => env('AUDIO_X_ACCEL', false),

        // Internal Nginx location prefix that maps to storage/app/public.
        'x_accel_prefix' => env('AUDIO_X_ACCEL_PREFIX', '/__audio_internal'),

        // CLOUD MIGRATION POINT: base URL for the future CDN/object store.
        'cloud_base_url' => env('AUDIO_CLOUD_BASE_URL'),
    ],

    'search' => [

        // Use MySQL/MariaDB FULLTEXT (MATCH … AGAINST) for disease search instead of LIKE.
        // Default false until the FULLTEXT index migration has run (see DEPLOYMENT.md).
        // The repository always falls back to LIKE if the index is missing or the driver
        // is not MySQL/MariaDB, so flipping this can never break search.
        'use_fulltext' => env('SEARCH_USE_FULLTEXT', false),
    ],

    'redis' => [

        // When a redis driver is selected (cache/session/queue) but the server is
        // unreachable, fall back to file/database drivers so the app keeps serving.
        'auto_fallback' => env('REDIS_AUTO_FALLBACK', true),
    ],

    'cache' => [

        // Log a warning when the file cache driver is used in production (file cache is
        // per-node and slow for rate limiting / shared state — prefer redis or database).
        'warn_file_driver_in_production' => env('SCALABILITY_CACHE_WARN', true),
    ],
];
