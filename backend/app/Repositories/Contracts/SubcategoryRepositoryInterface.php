<?php

namespace App\Repositories\Contracts;

use App\Models\Subcategory;

interface SubcategoryRepositoryInterface
{
    public function findBySlug(string $slug): ?Subcategory;
}
