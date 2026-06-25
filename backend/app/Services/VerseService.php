<?php

namespace App\Services;

use App\Repositories\Contracts\VerseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class VerseService
{
    public function __construct(private VerseRepositoryInterface $repository) {}

    public function searchVerses(string $term, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->searchVerses($term, $perPage);
    }
}
