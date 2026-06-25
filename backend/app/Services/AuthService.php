<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): array
    {
        $user = DB::transaction(function () use ($data) {
            $user = User::create([
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
        $user = User::where('email', $email)->first();

        if (! $user || ! $user->password || ! Hash::check($password, $user->password)) {
            return null;
        }

        return $this->tokenResponse($user);
    }

    public function updateProfile(User $user, array $data): User
    {
        // Only overwrite columns that were actually submitted, so a partial
        // update never blanks out fields the client didn't touch.
        $user->fill(array_filter(
            $data,
            static fn ($value) => $value !== null,
        ));
        $user->save();

        return $user->fresh();
    }

    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token) {
            $token->delete();
        }
    }

    private function tokenResponse(User $user): array
    {
        return [
            'user'  => $user->fresh(),
            'token' => $user->createToken('mobile')->plainTextToken,
        ];
    }
}
