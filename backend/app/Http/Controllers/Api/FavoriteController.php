<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DiseaseResource;
use App\Http\Resources\FavoriteNodeResource;
use App\Services\FavoriteNodeService;
use App\Services\FavoriteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class FavoriteController extends Controller
{
    public function __construct(
        private FavoriteService $service,
        private FavoriteNodeService $nodeService,
    ) {}

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
            // Only active, non-deleted diseases: hidden IDs must not be favoritable
            // (or discoverable through the validation error).
            $data = $request->validate([
                'disease_id' => [
                    'required',
                    'integer',
                    Rule::exists('diseases', 'id')->where('is_active', true)->whereNull('deleted_at'),
                ],
            ]);

            $isFavorited = $this->service->toggle($request->user()->id, (int) $data['disease_id']);

            return $this->success(['is_favorited' => $isFavorited]);
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    /** Favorited category/subcategory "direct" playlist nodes — separate from disease favorites above. */
    public function nodes(Request $request): JsonResponse
    {
        try {
            return $this->success(
                FavoriteNodeResource::collection($this->nodeService->getForUser($request->user()->id))
            );
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function toggleNode(Request $request): JsonResponse
    {
        try {
            $nodeTable = $request->input('kind') === 'category' ? 'categories' : 'subcategories';

            $data = $request->validate([
                'kind'    => 'required|in:category,subcategory',
                'node_id' => [
                    'required',
                    'integer',
                    Rule::exists($nodeTable, 'id')->where('is_active', true)->whereNull('deleted_at'),
                ],
            ]);

            $isFavorited = $this->nodeService->toggle(
                $request->user()->id,
                $data['kind'],
                (int) $data['node_id'],
            );

            return $this->success(['is_favorited' => $isFavorited]);
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
