<?php

namespace App\Services;

use App\Models\NotificationPreference;
use App\Models\User;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public function __construct(private NotificationRepositoryInterface $repository) {}

    public function getPreferences(User $user): NotificationPreference
    {
        return $this->repository->preferencesFor($user);
    }

    public function updatePreferences(User $user, array $data): NotificationPreference
    {
        return DB::transaction(fn () => $this->repository->updatePreferences($user, $data));
    }

    public function registerPushToken(User $user, string $token): void
    {
        DB::transaction(fn () => $this->repository->updatePushToken($user, $token));
    }
}
