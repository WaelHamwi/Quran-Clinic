<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Behind ngrok / a reverse proxy, honor X-Forwarded-Proto so asset()
        // and url() generate https links (otherwise images load over http and
        // get blocked by ngrok and the device's cleartext policy).
        $middleware->trustProxies(at: '*', headers: Request::HEADER_X_FORWARDED_FOR
            | Request::HEADER_X_FORWARDED_HOST
            | Request::HEADER_X_FORWARDED_PORT
            | Request::HEADER_X_FORWARDED_PROTO
            | Request::HEADER_X_FORWARDED_AWS_ELB);

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \App\Http\Middleware\SetLocale::class,
        ]);
        $middleware->api(append: [
            \App\Http\Middleware\LogUserActivity::class,
        ]);
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (\LogicException $e, \Illuminate\Http\Request $request) {
            if ($request->hasHeader('X-Livewire')) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'errors'  => ['_logic' => [$e->getMessage()]],
                ], 422);
            }
        });
    })->create();
