<?php

namespace App\Services;

use App\Repositories\Contracts\FavoriteRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FavoriteService
{
    public function __construct(private FavoriteRepositoryInterface $repository) {}

    public function getForUser(int $userId): Collection
    {
        return $this->repository->forUser($userId);
    }

    public function toggle(int $userId, int $diseaseId): bool
    {
        return DB::transaction(fn () => $this->repository->toggle($userId, $diseaseId));
    }
}
