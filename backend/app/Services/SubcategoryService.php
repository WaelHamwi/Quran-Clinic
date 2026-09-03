<?php

namespace App\Services;

use App\Models\Subcategory;
use App\Repositories\Contracts\SubcategoryRepositoryInterface;

class SubcategoryService
{
    /**
     * A subcategory write invalidates the category navigation tree (owned by
     * CategoryService) — that cached payload embeds subcategories. Re-exported
     * from CategoryService so the key has a single source of truth.
     */
    public const CACHE_KEYS = CategoryService::CACHE_KEYS;

    public function __construct(private SubcategoryRepositoryInterface $repository) {}

    public function getBySlug(string $slug): ?Subcategory
    {
        return $this->repository->findBySlug($slug);
    }
}
