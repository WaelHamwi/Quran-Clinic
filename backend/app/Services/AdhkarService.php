<?php

namespace App\Services;

use App\Models\AdhkarCategory;
use App\Repositories\Contracts\AdhkarRepositoryInterface;
use App\Support\ModelCache;
use Illuminate\Support\Collection;

class AdhkarService
{
    public const CACHE_CATEGORIES = 'adhkar.v1.categories';

    public const CACHE_TODAY = 'adhkar.v1.today';

    /** Keys invalidated when an Adhkar category/section/item is written. */
    public const CACHE_KEYS = [self::CACHE_CATEGORIES, self::CACHE_TODAY];

    public function __construct(private AdhkarRepositoryInterface $repository) {}

    public function categories(): Collection
    {
        return ModelCache::rememberMany(self::CACHE_CATEGORIES, 300, fn () => $this->repository->categories());
    }

    public function getCategoryBySlug(string $slug): ?AdhkarCategory
    {
        return $this->repository->findCategoryBySlug($slug);
    }

    public function itemsByCategorySlug(string $slug): Collection
    {
        return $this->repository->itemsByCategorySlug($slug);
    }

    public function today(): Collection
    {
        return ModelCache::rememberMany(self::CACHE_TODAY, 300, fn () => $this->repository->todayCategories());
    }

    public function waking(): Collection
    {
        return $this->repository->wakingItems();
    }
}
