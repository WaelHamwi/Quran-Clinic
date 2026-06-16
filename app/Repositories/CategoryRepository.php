<?php

namespace App\Repositories;

use App\Models\Category;
use App\Models\Subcategory;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Support\Collection;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function getAll(): Collection
    {
        return Category::active()
            ->ordered()
            ->with([
                'subcategories'  => fn ($q) => $q->active()->ordered()->withCount('diseases'),
                'directDiseases' => fn ($q) => $q->active()->ordered(),
            ])
            ->get();
    }

    public function findBySlug(string $slug): ?Category
    {
        return Category::active()
            ->where('slug', $slug)
            ->with([
                'subcategories'  => fn ($q) => $q->active()->ordered()->withCount(['diseases', 'recordings']),
                'directDiseases' => fn ($q) => $q->active()->ordered()->withCount('recordings'),
                'recordings'     => fn ($q) => $q->orderBy('session_number'),
            ])
            ->first();
    }

    public function findSubcategoryBySlug(string $slug): ?Subcategory
    {
        return Subcategory::active()
            ->where('slug', $slug)
            ->with([
                'category',
                'diseases'   => fn ($q) => $q->active()->ordered(),
                'recordings' => fn ($q) => $q->orderBy('session_number'),
            ])
            ->first();
    }
}
