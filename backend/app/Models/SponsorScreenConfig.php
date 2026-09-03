<?php

namespace App\Models;

use App\Models\Concerns\InvalidatesCache;
use App\Services\SponsorService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SponsorScreenConfig extends Model
{
    use InvalidatesCache;

    protected $table = 'sponsor_screen_config';

    protected $fillable = ['is_enabled', 'display_duration_seconds', 'selected_sponsor_id'];

    /** Admin toggling the screen on/off must take effect immediately (FR-2.5). */
    protected function cacheKeysToForget(): array
    {
        return SponsorService::CACHE_KEYS;
    }

    protected function casts(): array
    {
        return [
            'is_enabled'               => 'boolean',
            'display_duration_seconds' => 'integer',
            'selected_sponsor_id'      => 'integer',
        ];
    }

    public function sponsor(): BelongsTo
    {
        return $this->belongsTo(Sponsor::class, 'selected_sponsor_id');
    }

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'is_enabled'               => true,
            'display_duration_seconds' => 3,
        ]);
    }
}
