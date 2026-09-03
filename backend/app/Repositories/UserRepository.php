<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function create(array $attributes): User
    {
        return User::create($attributes);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function update(User $user, array $attributes): User
    {
        $user->fill($attributes);
        $user->save();

        return $user->fresh();
    }

    /**
     * Permanently remove the account. forceDelete() bypasses SoftDeletes so the
     * row is actually gone, letting the DB-level cascades clean up favorites,
     * feedback, notifications and the oauth_providers link — freeing the email
     * for a clean re-signup.
     */
    public function forceDelete(User $user): void
    {
        $user->forceDelete();
    }
}
