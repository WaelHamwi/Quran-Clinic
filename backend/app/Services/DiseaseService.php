<?php

namespace App\Services;

use App\Models\Disease;
use App\Repositories\Contracts\DiseaseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class DiseaseService
{
    public function __construct(private DiseaseRepositoryInterface $repository) {}

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage);
    }

    public function getBySlug(string $slug): ?Disease
    {
        return $this->repository->findBySlug($slug);
    }

    public function search(string $term): Collection
    {
        return $this->repository->search($term);
    }
}
