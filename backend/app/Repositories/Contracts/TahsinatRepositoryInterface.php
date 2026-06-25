<?php

namespace App\Repositories\Contracts;

use App\Models\TahsinatCategory;
use Illuminate\Support\Collection;

interface TahsinatRepositoryInterface
{
    public function categories(): Collection;

    public function findCategoryBySlug(string $slug): ?TahsinatCategory;

    public function itemsByCategorySlug(string $slug): Collection;
}
