<?php

namespace App\Services;

use App\Models\AdhkarCategory;
use App\Repositories\Contracts\AdhkarRepositoryInterface;
use App\Support\ModelCache;
use Illuminate\Support\Collection;

class AdhkarService
{
    public function __construct(private AdhkarRepositoryInterface $repository) {}

    public function categories(): Collection
    {
        return ModelCache::rememberMany('adhkar.v1.categories', 300, fn () => $this->repository->categories());
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
        return ModelCache::rememberMany('adhkar.v1.today', 300, fn () => $this->repository->todayCategories());
    }

    public function waking(): Collection
    {
        return $this->repository->wakingItems();
    }
}
