<?php

namespace App\Policies;

use App\Models\User;

class ContentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, $model): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, $model): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, $model): bool
    {
        return $user->isAdmin();
    }

    public function deleteAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, $model): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, $model): bool
    {
        return $user->isAdmin();
    }
}
