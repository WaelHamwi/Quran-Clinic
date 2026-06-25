<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recording extends Model
{
    use HasTranslations, SoftDeletes;

    protected $fillable = [
        'disease_id', 'category_id', 'subcategory_id', 'session_number', 'description',
        'segments', 'audio_path', 'duration_seconds', 'is_free', 'is_general', 'plays_count', 'created_by',
    ];

    public array $translatable = ['description'];

    protected function casts(): array
    {
        return [
            'disease_id'       => 'integer',
            'category_id'      => 'integer',
            'subcategory_id'   => 'integer',
            'session_number'   => 'integer',
            'duration_seconds' => 'integer',
            'is_free'          => 'boolean',
            'is_general'       => 'boolean',
            'plays_count'      => 'integer',
            'created_by'       => 'integer',
            'segments'         => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (self $r): void {
            if (! empty($r->subcategory_id)) {
                $sub = Subcategory::find($r->subcategory_id);
                if ($sub && $sub->diseases()->exists()) {
                    throw new \LogicException('Cannot assign a recording directly to a subcategory that already has diseases.');
                }
            }
        });

        static::creating(function (Recording $recording) {
            if (! $recording->session_number) {
                // Scope session numbering to the parent (category, subcategory or disease).
                $query = match (true) {
                    (bool) $recording->category_id    => static::where('category_id', $recording->category_id),
                    (bool) $recording->subcategory_id => static::where('subcategory_id', $recording->subcategory_id),
                    default                           => static::where('disease_id', $recording->disease_id),
                };
                $recording->session_number = ($query->max('session_number') ?? 0) + 1;
            }

            // First recording in its group automatically becomes the free session.
            if (! $recording->is_free) {
                $freeExists = match (true) {
                    (bool) $recording->disease_id     => static::where('disease_id', $recording->disease_id)->where('is_free', true)->exists(),
                    (bool) $recording->subcategory_id => static::where('subcategory_id', $recording->subcategory_id)->where('is_free', true)->exists(),
                    (bool) $recording->category_id    => static::where('category_id', $recording->category_id)->where('is_free', true)->exists(),
                    default                           => true,
                };
                if (! $freeExists) {
                    $recording->is_free = true;
                }
            }
        });

        // When a recording is marked free, clear the flag on all siblings in the same group.
        static::saved(function (Recording $recording) {
            if (! $recording->is_free) {
                return;
            }

            $siblings = static::where('id', '!=', $recording->id)->where('is_free', true);

            if ($recording->disease_id) {
                $siblings->where('disease_id', $recording->disease_id);
            } elseif ($recording->subcategory_id) {
                $siblings->where('subcategory_id', $recording->subcategory_id);
            } elseif ($recording->category_id) {
                $siblings->where('category_id', $recording->category_id);
            } else {
                return;
            }

            $siblings->update(['is_free' => false]);
        });
    }

    public function disease(): BelongsTo
    {
        return $this->belongsTo(Disease::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeFree(Builder $query): Builder
    {
        return $query->where('is_free', true);
    }

    public function scopePremium(Builder $query): Builder
    {
        return $query->where('is_free', false);
    }

    public function scopeGeneral(Builder $query): Builder
    {
        return $query->where('is_general', true);
    }

    public function isFreeSession(): bool
    {
        return $this->is_free;
    }

    public function streamUrl(): ?string
    {
        if (! $this->audio_path) {
            return null;
        }

        return str_starts_with($this->audio_path, 'http')
            ? $this->audio_path
            : asset('storage/' . ltrim($this->audio_path, '/'));
    }

    public function canBeAccessedBy(?User $user): bool
    {
        if ($this->isFreeSession()) {
            return true;
        }

        return $user !== null && ($user->isSubscribed() || $user->hasActiveTrial());
    }
}
