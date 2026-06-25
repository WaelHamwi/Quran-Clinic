<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    protected $fillable = ['user_id', 'disease_id'];

    protected function casts(): array
    {
        return [
            'user_id'    => 'integer',
            'disease_id' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function disease(): BelongsTo
    {
        return $this->belongsTo(Disease::class);
    }

    public static function toggle(int $userId, int $diseaseId): bool
    {
        $existing = static::where('user_id', $userId)
            ->where('disease_id', $diseaseId)
            ->first();

        if ($existing) {
            $existing->delete();

            return false;
        }

        static::create(['user_id' => $userId, 'disease_id' => $diseaseId]);

        return true;
    }
}
