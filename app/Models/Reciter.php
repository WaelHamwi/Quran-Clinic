<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reciter extends Model
{
    use HasFactory, HasTranslations, SoftDeletes;

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
