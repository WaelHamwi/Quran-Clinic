<?php

namespace App\Repositories;

use App\Models\Reciter;
use App\Repositories\Contracts\ReciterRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ReciterRepository implements ReciterRepositoryInterface
{
    public function getAllActive(int $perPage): LengthAwarePaginator
    {
        return Reciter::active()->orderBy('id')->paginate($perPage);
    }

    public function findById(int $id): ?Reciter
    {
        return Reciter::with(['recitations.surah'])->find($id);
    }
}
