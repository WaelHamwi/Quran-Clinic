<?php

namespace App\Services;

use App\Models\TahsinatCategory;
use App\Repositories\Contracts\TahsinatRepositoryInterface;
use App\Support\ModelCache;
use Illuminate\Support\Collection;

class TahsinatService
{
    public function __construct(private TahsinatRepositoryInterface $repository) {}

    public function categories(): Collection
    {
        return ModelCache::rememberMany('tahsinat.v1.categories', 300, fn () => $this->repository->categories());
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
