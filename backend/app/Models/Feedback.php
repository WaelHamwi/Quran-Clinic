<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    protected $table = 'feedback';

    protected $fillable = [
        'user_id', 'service_type', 'service_id',
        'was_beneficial', 'likes', 'dislikes', 'comment',
    ];

    protected function casts(): array
    {
        return [
            'user_id'        => 'integer',
            'service_id'     => 'integer',
            'was_beneficial' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
