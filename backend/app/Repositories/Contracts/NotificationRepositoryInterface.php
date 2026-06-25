<?php

namespace App\Repositories\Contracts;

use App\Models\NotificationPreference;
use App\Models\User;

interface NotificationRepositoryInterface
{
    public function preferencesFor(User $user): NotificationPreference;

    public function updatePreferences(User $user, array $data): NotificationPreference;

    public function updatePushToken(User $user, string $token): void;
}
