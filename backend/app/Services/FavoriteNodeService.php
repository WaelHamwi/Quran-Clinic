<?php

namespace App\Services;

use App\Repositories\Contracts\FavoriteNodeRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class FavoriteNodeService
{
    public function __construct(private FavoriteNodeRepositoryInterface $repository) {}

    public function getForUser(int $userId): Collection
    {
        return $this->repository->forUser($userId);
    }

    public function toggle(int $userId, string $kind, int $nodeId): bool
    {
        return DB::transaction(fn () => $this->repository->toggle($userId, $kind, $nodeId));
    }
}
