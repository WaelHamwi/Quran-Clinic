<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Subcategory;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class CategoryService
{
    public function __construct(private CategoryRepositoryInterface $repository) {}

    public function getAll(): Collection
    {
        // Intentionally not cached: PHP database-cache serializes Eloquent models,
        // which breaks with __PHP_Incomplete_Class whenever models change.
        return $this->repository->getAll();
    }

    public function getBySlug(string $slug): ?Category
    {
        return $this->repository->findBySlug($slug);
    }

    public function getSubcategoryBySlug(string $slug): ?Subcategory
    {
        return $this->repository->findSubcategoryBySlug($slug);
    }
}
