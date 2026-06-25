<?php

namespace App\Repositories\Contracts;

use App\Models\AdhkarCategory;
use Illuminate\Support\Collection;

interface AdhkarRepositoryInterface
{
    public function categories(): Collection;

    public function findCategoryBySlug(string $slug): ?AdhkarCategory;

    public function itemsByCategorySlug(string $slug): Collection;

    public function todayCategories(): Collection;

    public function wakingItems(): Collection;
}
