<?php

namespace App\Repositories;

use App\Models\Disease;
use App\Models\Favorite;
use App\Repositories\Contracts\FavoriteRepositoryInterface;
use Illuminate\Support\Collection;

class FavoriteRepository implements FavoriteRepositoryInterface
{
    public function forUser(int $userId): Collection
    {
        return Disease::active()
            ->whereHas('favoritedBy', fn ($q) => $q->where('users.id', $userId))
            ->with('subcategory')
            ->ordered()
            ->get();
    }

    public function toggle(int $userId, int $diseaseId): bool
    {
        return Favorite::toggle($userId, $diseaseId);
    }

    public function isFavorited(int $userId, int $diseaseId): bool
    {
        return Favorite::where('user_id', $userId)
            ->where('disease_id', $diseaseId)
            ->exists();
    }
}
