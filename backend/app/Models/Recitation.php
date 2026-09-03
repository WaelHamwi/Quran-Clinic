<?php

namespace App\Models;

use App\Models\Concerns\InvalidatesCache;
use App\Services\RecitationService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recitation extends Model
{
    use HasFactory, InvalidatesCache, SoftDeletes;

    protected function cacheKeysToForget(): array
    {
        return RecitationService::CACHE_KEYS;
    }

    protected $fillable = [
        'reciter_id',
        'surah_id',
        'audio_path',
        'duration_seconds',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
    ];

    public function reciter(): BelongsTo
    {
        return $this->belongsTo(Reciter::class);
    }

    public function surah(): BelongsTo
    {
        return $this->belongsTo(Surah::class);
    }
}
