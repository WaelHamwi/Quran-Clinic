<?php

namespace App\Repositories\Contracts;

use App\Models\Disease;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface DiseaseRepositoryInterface
{
    public function paginate(int $perPage): LengthAwarePaginator;

    public function findBySlug(string $slug): ?Disease;

    public function search(string $term): Collection;
}
