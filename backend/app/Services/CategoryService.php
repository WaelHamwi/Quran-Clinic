<?php

namespace App\Services;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Support\ModelCache;
use Illuminate\Support\Collection;

class CategoryService
{
    /** Cache of the full category→subcategory(→disease counts) navigation tree. */
    public const CACHE_KEY = 'categories.v1.all';

    /** Keys invalidated when a Category/Subcategory/Disease is written. */
    public const CACHE_KEYS = [self::CACHE_KEY];

    public function __construct(private CategoryRepositoryInterface $repository) {}

    public function getAll(): Collection
    {
        return ModelCache::rememberMany(self::CACHE_KEY, 300, fn () => $this->repository->getAll());
    }

    public function getBySlug(string $slug): ?Category
    {
        return $this->repository->findBySlug($slug);
    }
}
