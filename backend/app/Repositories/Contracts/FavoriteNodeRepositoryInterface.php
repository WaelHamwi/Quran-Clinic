<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface FavoriteNodeRepositoryInterface
{
    public function forUser(int $userId): Collection;

    public function toggle(int $userId, string $kind, int $nodeId): bool;
}
