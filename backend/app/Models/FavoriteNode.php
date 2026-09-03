<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FavoriteNode extends Model
{
    protected $fillable = ['user_id', 'kind', 'node_id'];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'node_id' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** The Category or Subcategory this favorite points at, based on `kind`. */
    public function node(): Category|Subcategory|null
    {
        return $this->kind === 'category'
            ? Category::find($this->node_id)
            : Subcategory::find($this->node_id);
    }

    public static function toggle(int $userId, string $kind, int $nodeId): bool
    {
        $existing = static::where('user_id', $userId)
            ->where('kind', $kind)
            ->where('node_id', $nodeId)
            ->first();

        if ($existing) {
            $existing->delete();

            return false;
        }

        static::create(['user_id' => $userId, 'kind' => $kind, 'node_id' => $nodeId]);

        return true;
    }
}
