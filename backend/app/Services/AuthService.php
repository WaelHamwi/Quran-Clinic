<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    public function __construct(private UserRepositoryInterface $repository) {}

    public function register(array $data): array
    {
        $user = DB::transaction(function () use ($data) {
            $user = $this->repository->create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => $data['password'],
                'phone'    => $data['phone'] ?? null,
                'country'  => $data['country'] ?? null,
                'gender'   => $data['gender'] ?? null,
            ]);

            $user->assignRole('user');

            return $user;
        });

        return $this->tokenResponse($user);
    }

    public function login(string $email, string $password): ?array
    {
        $user = $this->repository->findByEmail($email);

        if (! $user || ! $user->password || ! Hash::check($password, $user->password)) {
            return null;
        }

        return $this->tokenResponse($user);
    }

    public function updateProfile(User $user, array $data): User
    {
        // Only overwrite columns that were actually submitted, so a partial
        // update never blanks out fields the client didn't touch.
        return $this->repository->update($user, array_filter(
            $data,
            static fn ($value) => $value !== null,
        ));
    }

    public function logout(User $user): void
    {
        // currentAccessToken() is declared as the HasAbilities contract (which
        // has no delete()); on the mobile Bearer guard it is always a persisted
        // PersonalAccessToken, so annotate the concrete type and revoke it.
        /** @var PersonalAccessToken|null $token */
        $token = $user->currentAccessToken();

        $token?->delete();
    }

    public function deleteAccount(User $user): void
    {
        // Revoke all API tokens (Sanctum), then permanently purge the account.
        $user->tokens()->delete();

        $this->repository->forceDelete($user);
    }

    private function tokenResponse(User $user): array
    {
        return [
            'user'  => $user->fresh(),
            'token' => $user->issueApiToken('mobile'),
        ];
    }
}
