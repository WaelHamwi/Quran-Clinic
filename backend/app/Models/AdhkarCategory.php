<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdhkarCategory extends Model
{
    use HasTranslations;

    protected $fillable = ['name', 'slug', 'icon', 'day_number', 'display_order', 'is_active'];

    public array $translatable = ['name'];

    protected function casts(): array
    {
        return [
            'day_number'    => 'integer',
            'display_order' => 'integer',
            'is_active'     => 'boolean',
        ];
    }

    /** Absolute URL to the uploaded icon (SVG/PNG), or null when none is set. */
    public function iconUrl(): ?string
    {
        if (! $this->icon || ! str_contains($this->icon, '/')) {
            return null;
        }

        return str_starts_with($this->icon, 'http')
            ? $this->icon
            : asset('storage/' . ltrim($this->icon, '/'));
    }

    public function sections(): HasMany
    {
        return $this->hasMany(AdhkarSection::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(AdhkarItem::class);
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
