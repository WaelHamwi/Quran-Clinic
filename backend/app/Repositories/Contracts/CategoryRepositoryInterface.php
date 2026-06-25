<?php

namespace App\Repositories\Contracts;

use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Support\Collection;

interface CategoryRepositoryInterface
{
    public function getAll(): Collection;

    public function findBySlug(string $slug): ?Category;

    public function findSubcategoryBySlug(string $slug): ?Subcategory;
}
