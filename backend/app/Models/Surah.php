<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\InvalidatesCache;
use App\Services\SurahService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Surah extends Model
{
    use HasFactory, HasTranslations, InvalidatesCache, SoftDeletes;

    protected function cacheKeysToForget(): array
    {
        return SurahService::CACHE_KEYS;
    }

    protected $fillable = [
        'name',
        'transliteration',
        'type',
        'total_verses',
    ];

    public array $translatable = ['name'];

    protected $casts = [
        'total_verses' => 'integer',
    ];

    public function verses(): HasMany
    {
        return $this->hasMany(Verse::class);
    }

    public function recitations(): HasMany
    {
        return $this->hasMany(Recitation::class);
    }
}
