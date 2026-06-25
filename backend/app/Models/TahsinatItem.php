<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TahsinatItem extends Model
{
    use HasTranslations;

    protected $fillable = [
        'tahsinat_category_id', 'tahsinat_section_id', 'label', 'text',
        'repetitions', 'hint', 'applicability', 'display_order',
    ];

    public array $translatable = ['label', 'text', 'hint'];

    protected function casts(): array
    {
        return [
            'tahsinat_category_id' => 'integer',
            'tahsinat_section_id'  => 'integer',
            'repetitions'          => 'integer',
            'display_order'        => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TahsinatCategory::class, 'tahsinat_category_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(TahsinatSection::class, 'tahsinat_section_id');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('id');
    }
}
