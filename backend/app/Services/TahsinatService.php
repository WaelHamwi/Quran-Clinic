<?php

namespace App\Services;

use App\Models\TahsinatCategory;
use App\Repositories\Contracts\TahsinatRepositoryInterface;
use App\Support\ModelCache;
use Illuminate\Support\Collection;

class TahsinatService
{
    public const CACHE_CATEGORIES = 'tahsinat.v1.categories';

    /** Keys invalidated when a Tahsinat category/section/item is written. */
    public const CACHE_KEYS = [self::CACHE_CATEGORIES];

    public function __construct(private TahsinatRepositoryInterface $repository) {}

    public function categories(): Collection
    {
        return ModelCache::rememberMany(self::CACHE_CATEGORIES, 300, fn () => $this->repository->categories());
    }

    public function getCategoryBySlug(string $slug): ?TahsinatCategory
    {
        return $this->repository->findCategoryBySlug($slug);
    }

    public function itemsByCategorySlug(string $slug): Collection
    {
        return $this->repository->itemsByCategorySlug($slug);
    }
}
