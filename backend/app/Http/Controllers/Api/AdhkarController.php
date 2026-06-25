<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdhkarCategoryResource;
use App\Http\Resources\AdhkarItemResource;
use App\Services\AdhkarService;
use Illuminate\Http\JsonResponse;

class AdhkarController extends Controller
{
    public function __construct(private AdhkarService $service) {}

    public function categories(): JsonResponse
    {
        try {
            return $this->success(AdhkarCategoryResource::collection($this->service->categories()));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function items(string $slug): JsonResponse
    {
        try {
            $category = $this->service->getCategoryBySlug($slug);

            if (! $category) {
                return $this->error('Adhkar category not found', 404);
            }

            return $this->success(new AdhkarCategoryResource($category));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function today(): JsonResponse
    {
        try {
            return $this->success(AdhkarCategoryResource::collection($this->service->today()));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function waking(): JsonResponse
    {
        try {
            return $this->success(AdhkarItemResource::collection($this->service->waking()));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
