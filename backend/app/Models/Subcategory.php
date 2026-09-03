<?php

namespace App\Models;

use App\Exceptions\BusinessRuleException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\InvalidatesCache;
use App\Services\SubcategoryService;

class Subcategory extends Model
{
    use HasTranslations, InvalidatesCache, SoftDeletes;

    protected function cacheKeysToForget(): array
    {
        return SubcategoryService::CACHE_KEYS;
    }

    /** Holds diseases, which carry the recordings. */
    public const TYPE_STANDARD = 'standard';

    /** Holds recordings attached straight to it, with no diseases in between. */
    public const TYPE_DIRECT = 'direct';

    public const TYPES = [self::TYPE_STANDARD, self::TYPE_DIRECT];

    protected $fillable = ['category_id', 'name', 'slug', 'type', 'icon', 'display_order', 'is_active'];

    protected static function booted(): void
    {
        static::creating(function (self $r): void {
            static::assignSlug($r);
            $cat = Category::find($r->category_id);
            if ($cat && ! ($cat->type === 'standard')) {
                throw new BusinessRuleException('Cannot add a subcategory to a category that is not type standard.');
            }
        });
        static::updating(function (self $r): void {
            if ($r->isDirty('name')) {
                static::assignSlug($r);
            }
            // Mirrors Category::booted(): the kind cannot move out from under
            // content that already depends on it.
            if ($r->isDirty('type')) {
                if ($r->type === self::TYPE_DIRECT && $r->diseases()->exists()) {
                    throw new BusinessRuleException('Cannot switch to direct recordings: remove this subcategory\'s diseases first.');
                }
                if ($r->type !== self::TYPE_DIRECT && $r->recordings()->exists()) {
                    throw new BusinessRuleException('Cannot switch away from direct recordings: unlink the attached recordings first.');
                }
            }
        });
    }

    public function isDirect(): bool
    {
        return $this->type === self::TYPE_DIRECT;
    }

    private static function assignSlug(self $record): void
    {
        $en = $record->getTranslation('name', 'en', false);
        $base = $en
            ? Str::slug($en)
            : Str::slug(Str::transliterate($record->getTranslation('name', 'ar', false) ?? ''));

        if (! $base) {
            return;
        }

        $slug = $base;
        $n    = 1;
        while (
            static::withTrashed()
                ->where('slug', $slug)
                ->when($record->exists, fn ($q) => $q->where('id', '!=', $record->id))
                ->exists()
        ) {
            $slug = $base . '-' . $n++;
        }

        $record->slug = $slug;
    }

    public array $translatable = ['name'];

    protected function casts(): array
    {
        return [
            'category_id'   => 'integer',
            'display_order' => 'integer',
            'is_active'     => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** Absolute URL to the uploaded icon (SVG/PNG), or null when none is set. */
    public function iconUrl(): ?string
    {
        if (! $this->icon) {
            return null;
        }

        return str_starts_with($this->icon, 'http')
            ? $this->icon
            : asset('storage/' . ltrim($this->icon, '/'));
    }

    public function diseases(): HasMany
    {
        return $this->hasMany(Disease::class);
    }

    /**
     * The ordered sequence of ruqyah recordings attached directly to this
     * subcategory (no diseases). A recording may appear more than once, so the
     * pivot id — not the recording id — is what identifies an occurrence.
     */
    public function recordings(): MorphToMany
    {
        return $this->morphToMany(Recording::class, 'attachable', 'recording_attachments')
            ->using(RecordingAttachment::class)
            ->withPivot(['id', 'session_number'])
            ->withTimestamps()
            ->orderByPivot('session_number');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('id');
    }
}
