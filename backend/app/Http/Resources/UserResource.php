<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                      => $this->id,
            'name'                    => $this->name,
            'email'                   => $this->email,
            'phone'                   => $this->phone,
            'country'                 => $this->country,
            'gender'                  => $this->gender,
            'avatar_path'             => $this->getFilamentAvatarUrl(),
            'is_subscribed'           => $this->isSubscribed(),
            'has_active_trial'        => $this->hasActiveTrial(),
            'can_grant_trial'         => $this->canGrantTrial(),
            'subscription_expires_at' => $this->subscription_expires_at?->toIso8601String(),
            'trial_used_count'        => $this->trial_used_count,
        ];
    }
}
