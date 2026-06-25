<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdhkarSection extends Model
{
    use HasTranslations;

    protected $fillable = ['adhkar_category_id', 'name', 'order_randomly', 'display_order'];

    public array $translatable = ['name'];

    protected function casts(): array
    {
        return [
            'adhkar_category_id' => 'integer',
            'order_randomly'     => 'boolean',
            'display_order'      => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AdhkarCategory::class, 'adhkar_category_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(AdhkarItem::class);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('id');
    }
}
