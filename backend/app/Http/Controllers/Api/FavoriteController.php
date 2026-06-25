<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DiseaseResource;
use App\Services\FavoriteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FavoriteController extends Controller
{
    public function __construct(private FavoriteService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            return $this->success(
                DiseaseResource::collection($this->service->getForUser($request->user()->id))
            );
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function toggle(Request $request): JsonResponse
    {
        try {
            $data = $request->validate(['disease_id' => 'required|integer|exists:diseases,id']);

            $isFavorited = $this->service->toggle($request->user()->id, (int) $data['disease_id']);

            return $this->success(['is_favorited' => $isFavorited]);
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
