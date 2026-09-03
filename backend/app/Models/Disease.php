<?php

namespace App\Models;

use App\Exceptions\BusinessRuleException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\InvalidatesCache;
use App\Services\DiseaseService;

class Disease extends Model
{
    use HasFactory, HasTranslations, InvalidatesCache, SoftDeletes;

    protected function cacheKeysToForget(): array
    {
        return DiseaseService::CACHE_KEYS;
    }

    protected $fillable = [
        'subcategory_id', 'category_id', 'name', 'slug', 'icon',
        'display_order', 'is_active',
    ];

    protected static function booted(): void
    {
        static::creating(fn (self $r) => static::assignSlug($r));
        static::updating(function (self $r): void {
            if ($r->isDirty('name')) {
                static::assignSlug($r);
            }
        });
        static::saving(function (self $r): void {
            $hasSub = ! empty($r->subcategory_id);
            $hasCat = ! empty($r->category_id);

            if ($hasSub && $hasCat) {
                throw new BusinessRuleException('A disease cannot belong to both a subcategory and a direct category.');
            }
            if (! $hasSub && ! $hasCat) {
                throw new BusinessRuleException('A disease must belong to either a subcategory or a direct category.');
            }
            if ($hasSub) {
                $sub = Subcategory::find($r->subcategory_id);
                if ($sub && $sub->isDirect()) {
                    throw new BusinessRuleException('That subcategory is set to hold recordings directly, so it cannot take diseases.');
                }
                if ($sub && $sub->recordings()->exists()) {
                    throw new BusinessRuleException('Cannot assign a disease to a subcategory that already has direct recordings.');
                }
            }
            if ($hasCat) {
                $cat = Category::find($r->category_id);
                if ($cat && ! $cat->isDiseaseDirect()) {
                    throw new BusinessRuleException('The selected category does not accept direct diseases (must be type disease_direct).');
                }
                if ($cat && $cat->subcategories()->exists()) {
                    throw new BusinessRuleException('Cannot assign a disease directly to a category that already has subcategories.');
                }
            }
        });
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
            'subcategory_id' => 'integer',
            'category_id'    => 'integer',
            'display_order'  => 'integer',
            'is_active'      => 'boolean',
        ];
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function iconUrl(): ?string
    {
        if (! $this->icon) {
            return null;
        }

        return str_starts_with($this->icon, 'http')
            ? $this->icon
            : asset('storage/' . ltrim($this->icon, '/'));
    }

    /**
     * The ordered sequence of ruqyah recordings for this disease. A recording
     * may appear more than once, so the pivot id — not the recording id — is
     * what identifies an occurrence.
     */
    public function recordings(): MorphToMany
    {
        return $this->morphToMany(Recording::class, 'attachable', 'recording_attachments')
            ->using(RecordingAttachment::class)
            ->withPivot(['id', 'session_number'])
            ->withTimestamps()
            ->orderByPivot('session_number');
    }

    public function aliases(): HasMany
    {
        return $this->hasMany(DiseaseAlias::class);
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
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
