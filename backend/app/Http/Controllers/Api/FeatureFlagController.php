<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FeatureFlagService;
use Illuminate\Http\JsonResponse;

class FeatureFlagController extends Controller
{
    public function __construct(private FeatureFlagService $service) {}

    public function index(): JsonResponse
    {
        try {
            return $this->success($this->service->all());
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
