<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface FavoriteRepositoryInterface
{
    public function forUser(int $userId): Collection;

    public function toggle(int $userId, int $diseaseId): bool;

    public function isFavorited(int $userId, int $diseaseId): bool;
}
