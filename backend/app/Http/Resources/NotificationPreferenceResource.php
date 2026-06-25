<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NotificationPreferenceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'adhkar_morning_enabled' => $this->adhkar_morning_enabled,
            'adhkar_evening_enabled' => $this->adhkar_evening_enabled,
            'adhkar_sleep_enabled'   => $this->adhkar_sleep_enabled,
            'adhkar_waking_enabled'  => $this->adhkar_waking_enabled,
            'waking_start_time'      => $this->waking_start_time,
            'waking_end_time'        => $this->waking_end_time,
        ];
    }
}
