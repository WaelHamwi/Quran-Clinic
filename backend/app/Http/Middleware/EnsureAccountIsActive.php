<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->is_suspended) {
            return response()->json([
                'error'   => 'account_suspended',
                'message' => 'This account has been suspended.',
            ], 403);
        }

        return $next($request);
    }
}
