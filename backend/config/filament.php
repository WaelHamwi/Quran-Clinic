<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Broadcasting
    |--------------------------------------------------------------------------
    */

    'broadcasting' => [

        'echo' => [
            'broadcaster' => 'pusher',
            'key' => env('VITE_PUSHER_APP_KEY'),
            'cluster' => env('VITE_PUSHER_APP_CLUSTER'),
            'wsHost' => env('VITE_PUSHER_HOST'),
            'wsPort' => env('VITE_PUSHER_PORT'),
            'wssPort' => env('VITE_PUSHER_PORT'),
            'authEndpoint' => '/broadcasting/auth',
            'disableStats' => true,
            'encrypted' => true,
            'forceTLS' => false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Default Panel
    |--------------------------------------------------------------------------
    */

    'default_panel' => 'admin',

];
