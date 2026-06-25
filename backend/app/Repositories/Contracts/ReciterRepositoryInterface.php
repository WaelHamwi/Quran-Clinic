<?php

namespace App\Repositories\Contracts;

use App\Models\Reciter;
use Illuminate\Pagination\LengthAwarePaginator;

interface ReciterRepositoryInterface
{
    public function getAllActive(int $perPage): LengthAwarePaginator;
    public function findById(int $id): ?Reciter;
}
