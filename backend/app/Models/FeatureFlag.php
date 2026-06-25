<?php

namespace App\Models;

use App\Services\FeatureFlagService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FeatureFlag extends Model
{
    protected $fillable = ['feature_key', 'is_visible'];

    /**
     * Parent feature → its nested child features. The "Clinic" (المشفى) screen
     * hosts Courses, Adhkar and Tahsinat as sub-sections, so hiding the parent
     * forces every child off and locks its toggle in the admin.
     */
    public const CHILDREN = [
        'hospital' => ['adhkar', 'tahsinat', 'courses'],
    ];

    protected function casts(): array
    {
        return ['is_visible' => 'boolean'];
    }

    /** The parent feature key this flag is nested under, or null if it is top-level. */
    public function parentKey(): ?string
    {
        foreach (self::CHILDREN as $parent => $children) {
            if (in_array($this->feature_key, $children, true)) {
                return $parent;
            }
        }

        return null;
    }

    /** True when this flag is a child whose parent feature is currently hidden. */
    public function isLockedByParent(): bool
    {
        $parent = $this->parentKey();

        if ($parent === null) {
            return false;
        }

        $parentVisible = static::query()->where('feature_key', $parent)->value('is_visible');

        // A missing parent flag must never lock the child.
        return $parentVisible !== null && ! (bool) $parentVisible;
    }

    /**
     * - Cascade: turning a parent off forces all its children off immediately.
     * - Bust the cached feature map so the mobile app reflects changes right away.
     */
    protected static function booted(): void
    {
        static::saved(function (FeatureFlag $flag): void {
            if ($flag->wasChanged('is_visible') && $flag->is_visible === false) {
                $children = self::CHILDREN[$flag->feature_key] ?? [];

                if ($children !== []) {
                    // Mass update intentionally skips model events (no recursion);
                    // the cache is flushed below for the whole operation.
                    static::query()
                        ->whereIn('feature_key', $children)
                        ->where('is_visible', true)
                        ->update(['is_visible' => false]);
                }
            }

            Cache::forget(FeatureFlagService::CACHE_KEY);
        });

        static::deleted(fn () => Cache::forget(FeatureFlagService::CACHE_KEY));
    }
}
