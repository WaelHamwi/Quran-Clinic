<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function __construct(private CategoryService $service) {}

    public function index(): JsonResponse
    {
        try {
            return $this->success(CategoryResource::collection($this->service->getAll()));
        } catch (\Throwable $e) {
            logger()->error('CategoryController@index: ' . $e->getMessage());
            return $this->error('Server error', 500);
        }
    }

    public function show(string $slug): JsonResponse
    {
        try {
            $category = $this->service->getBySlug($slug);

            if (! $category) {
                return $this->error('Category not found', 404);
            }

            return $this->success(new CategoryResource($category));
        } catch (\Throwable $e) {
            logger()->error('CategoryController@show: ' . $e->getMessage());
            return $this->error('Server error', 500);
        }
    }
}
