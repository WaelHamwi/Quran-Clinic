<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubcategoryResource;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;

class SubcategoryController extends Controller
{
    public function __construct(private CategoryService $service) {}

    public function show(string $slug): JsonResponse
    {
        try {
            $subcategory = $this->service->getSubcategoryBySlug($slug);

            if (! $subcategory) {
                return $this->error('Subcategory not found', 404);
            }

            return $this->success(new SubcategoryResource($subcategory));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
