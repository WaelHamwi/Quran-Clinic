<?php

namespace App\Models;

use App\Exceptions\BusinessRuleException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\InvalidatesCache;
use App\Services\CategoryService;

class Category extends Model
{
    use HasFactory, HasTranslations, InvalidatesCache, SoftDeletes;

    protected function cacheKeysToForget(): array
    {
        return CategoryService::CACHE_KEYS;
    }

    protected $fillable = ['name', 'slug', 'icon', 'type', 'display_order', 'is_active'];

    protected static function booted(): void
    {
        static::creating(fn (self $r) => static::assignSlug($r));
        static::updating(function (self $r): void {
            if ($r->isDirty('name')) {
                static::assignSlug($r);
            }
            if ($r->isDirty('type')) {
                $new = $r->type;
                if ($new === 'standard' && $r->directDiseases()->exists()) {
                    throw new BusinessRuleException('Cannot change to standard: category has direct diseases.');
                }
                if ($new === 'disease_direct' && $r->subcategories()->exists()) {
                    throw new BusinessRuleException('Cannot change to disease_direct: category has subcategories.');
                }
                if ($new === 'direct' && ($r->subcategories()->exists() || $r->directDiseases()->exists())) {
                    throw new BusinessRuleException('Cannot change to direct: remove subcategories and direct diseases first.');
                }
                // Mirrors Disease::saving()'s "subcategory that already has
                // direct recordings" guard: only a direct category may hold
                // recordings, so moving off it would orphan those links.
                if ($new !== 'direct' && $r->recordings()->exists()) {
                    throw new BusinessRuleException('Cannot change type: unlink the attached recordings from this category first.');
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
            'display_order' => 'integer',
            'is_active'     => 'boolean',
        ];
    }

    public function subcategories(): HasMany
    {
        return $this->hasMany(Subcategory::class);
    }

    /**
     * The ordered sequence of ruqyah recordings attached directly to this
     * category (no subcategories). A recording may appear more than once, so
     * the pivot id — not the recording id — is what identifies an occurrence.
     */
    public function recordings(): MorphToMany
    {
        return $this->morphToMany(Recording::class, 'attachable', 'recording_attachments')
            ->using(RecordingAttachment::class)
            ->withPivot(['id', 'session_number'])
            ->withTimestamps()
            ->orderByPivot('session_number');
    }

    public function directDiseases(): HasMany
    {
        return $this->hasMany(Disease::class, 'category_id');
    }

    public function isDirect(): bool
    {
        return $this->type === 'direct';
    }

    public function isDiseaseDirect(): bool
    {
        return $this->type === 'disease_direct';
    }

    public function iconUrl(): ?string
    {
        if (! $this->icon || str_starts_with($this->icon, 'heroicon')) {
            return null;
        }

        return str_starts_with($this->icon, 'http')
            ? $this->icon
            : asset('storage/' . ltrim($this->icon, '/'));
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
