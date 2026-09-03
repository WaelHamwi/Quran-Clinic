<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\InvalidatesCache;
use App\Services\AdhkarService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdhkarItem extends Model
{
    use HasTranslations, InvalidatesCache;

    protected function cacheKeysToForget(): array
    {
        return AdhkarService::CACHE_KEYS;
    }

    protected $fillable = [
        'adhkar_category_id', 'adhkar_section_id', 'text', 'image',
        'repetitions', 'hint', 'daleel', 'display_order',
    ];

    public array $translatable = ['text', 'hint', 'daleel'];

    /** Absolute URL to the uploaded image, or null when none is set. */
    public function imageUrl(): ?string
    {
        if (! $this->image || ! str_contains($this->image, '/')) {
            return null;
        }

        return str_starts_with($this->image, 'http')
            ? $this->image
            : asset('storage/' . ltrim($this->image, '/'));
    }

    protected function casts(): array
    {
        return [
            'adhkar_category_id' => 'integer',
            'adhkar_section_id'  => 'integer',
            'repetitions'        => 'integer',
            'display_order'      => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AdhkarCategory::class, 'adhkar_category_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(AdhkarSection::class, 'adhkar_section_id');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('id');
    }
}
