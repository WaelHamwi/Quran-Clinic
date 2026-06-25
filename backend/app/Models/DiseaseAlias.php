<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\HasTranslations;

class DiseaseAlias extends Model
{
    use HasTranslations;

    protected $table = 'disease_aliases';

    protected $fillable = ['disease_id', 'alias'];

    public array $translatable = ['alias'];

    protected function casts(): array
    {
        return ['disease_id' => 'integer'];
    }

    public function disease(): BelongsTo
    {
        return $this->belongsTo(Disease::class);
    }
}
