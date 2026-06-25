<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id', 'adhkar_morning_enabled', 'adhkar_evening_enabled',
        'adhkar_sleep_enabled', 'adhkar_waking_enabled',
        'waking_start_time', 'waking_end_time',
    ];

    protected function casts(): array
    {
        return [
            'user_id'                => 'integer',
            'adhkar_morning_enabled' => 'boolean',
            'adhkar_evening_enabled' => 'boolean',
            'adhkar_sleep_enabled'   => 'boolean',
            'adhkar_waking_enabled'  => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
