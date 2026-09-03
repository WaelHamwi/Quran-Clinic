<?php

namespace App\Repositories;

use App\Models\NotificationPreference;
use App\Models\User;
use App\Repositories\Contracts\NotificationRepositoryInterface;

class NotificationRepository implements NotificationRepositoryInterface
{
    public function preferencesFor(User $user): NotificationPreference
    {
        $preference = NotificationPreference::firstOrCreate(['user_id' => $user->id]);

        // firstOrCreate returns the model as it was built in memory, where every
        // column the insert did not name is still unset — so a user's very first
        // request would report the toggles as null instead of the defaults the
        // database actually stored. Re-read the row so the defaults come back.
        if ($preference->wasRecentlyCreated) {
            $preference->refresh();
        }

        return $preference;
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
