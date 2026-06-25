<?php

namespace App\Repositories;

use App\Models\NotificationPreference;
use App\Models\User;
use App\Repositories\Contracts\NotificationRepositoryInterface;

class NotificationRepository implements NotificationRepositoryInterface
{
    public function preferencesFor(User $user): NotificationPreference
    {
        return NotificationPreference::firstOrCreate(['user_id' => $user->id]);
    }

    public function updatePreferences(User $user, array $data): NotificationPreference
    {
        $preference = $this->preferencesFor($user);
        $preference->update($data);

        return $preference;
    }

    public function updatePushToken(User $user, string $token): void
    {
        $user->forceFill(['expo_push_token' => $token])->save();
    }
}
