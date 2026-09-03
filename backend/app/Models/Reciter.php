<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\InvalidatesCache;
use App\Services\RecitationService;
use App\Services\ReciterService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reciter extends Model
{
    use HasFactory, HasTranslations, InvalidatesCache, SoftDeletes;

    protected function cacheKeysToForget(): array
    {
        // Recitations are cached with their reciter and filtered by reciter
        // activity, so toggling a reciter must flush that aggregate too.
        return array_merge(ReciterService::CACHE_KEYS, RecitationService::CACHE_KEYS);
    }

    protected $fillable = [
        'name',
        'bio',
        'photo_path',
        'is_active',
    ];

    public array $translatable = ['name', 'bio'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function recitations(): HasMany
    {
        return $this->hasMany(Recitation::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
