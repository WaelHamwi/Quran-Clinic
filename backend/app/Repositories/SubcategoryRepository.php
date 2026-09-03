<?php

namespace App\Repositories;

use App\Models\Subcategory;
use App\Repositories\Contracts\SubcategoryRepositoryInterface;

class SubcategoryRepository implements SubcategoryRepositoryInterface
{
    public function findBySlug(string $slug): ?Subcategory
    {
        return Subcategory::active()
            ->where('slug', $slug)
            ->with([
                'category',
                'diseases'   => fn ($q) => $q->active()->ordered(),
                'recordings',
            ])
            ->first();
    }
}
