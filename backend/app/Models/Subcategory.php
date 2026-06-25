<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Models\Concerns\HasTranslations;

class Subcategory extends Model
{
    use HasTranslations, SoftDeletes;

    protected $fillable = ['category_id', 'name', 'slug', 'icon', 'display_order', 'is_active'];

    protected static function booted(): void
    {
        static::creating(function (self $r): void {
            static::assignSlug($r);
            $cat = Category::find($r->category_id);
            if ($cat && ! ($cat->type === 'standard')) {
                throw new \LogicException('Cannot add a subcategory to a category that is not type standard.');
            }
        });
        static::updating(function (self $r): void {
            if ($r->isDirty('name')) {
                static::assignSlug($r);
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

    /** Ruqyah recordings attached directly to this subcategory (no diseases). */
    public function recordings(): HasMany
    {
        return $this->hasMany(Recording::class);
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
