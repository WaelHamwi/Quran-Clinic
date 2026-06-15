<?php

namespace App\Models;

use App\Services\FeatureFlagService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FeatureFlag extends Model
{
    protected $fillable = ['feature_key', 'is_visible'];

    protected function casts(): array
    {
        return ['is_visible' => 'boolean'];
    }

    /**
     * Bust the cached feature map whenever a flag is toggled, created or
     * deleted in the admin so the mobile app reflects the change right away.
     */
    protected static function booted(): void
    {
        $flush = static fn () => Cache::forget(FeatureFlagService::CACHE_KEY);

        static::saved($flush);
        static::deleted($flush);
    }
}
