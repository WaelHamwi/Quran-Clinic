<?php

namespace App\Models;

use App\Models\Concerns\InvalidatesCache;
use App\Services\FeatureFlagService;
use Illuminate\Database\Eloquent\Model;

class FeatureFlag extends Model
{
    use InvalidatesCache;

    protected $fillable = ['feature_key', 'is_visible'];

    protected function cacheKeysToForget(): array
    {
        return FeatureFlagService::CACHE_KEYS;
    }

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
     * Cascade: turning a parent off forces all its children off immediately.
     * (Cache busting is handled by the InvalidatesCache trait.)
     */
    protected static function booted(): void
    {
        static::saved(function (FeatureFlag $flag): void {
            if ($flag->wasChanged('is_visible') && $flag->is_visible === false) {
                $children = self::CHILDREN[$flag->feature_key] ?? [];

                if ($children !== []) {
                    // Mass update intentionally skips model events (no recursion);
                    // InvalidatesCache busts the feature map on this parent save.
                    static::query()
                        ->whereIn('feature_key', $children)
                        ->where('is_visible', true)
                        ->update(['is_visible' => false]);
                }
            }
        });
    }
}
