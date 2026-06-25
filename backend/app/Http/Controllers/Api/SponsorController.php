<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SponsorResource;
use App\Services\SponsorService;
use Illuminate\Http\JsonResponse;

class SponsorController extends Controller
{
    public function __construct(private SponsorService $service) {}

    public function index(): JsonResponse
    {
        try {
            return $this->success(SponsorResource::collection($this->service->getAll()));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function screen(): JsonResponse
    {
        try {
            $config = $this->service->screenConfig();

            return $this->success([
                'is_enabled'               => $config->is_enabled,
                'display_duration_seconds' => $config->display_duration_seconds,
                'sponsor'                  => $config->sponsor
                    ? new SponsorResource($config->sponsor)
                    : null,
            ]);
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
