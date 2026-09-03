<?php

namespace App\Models;

use App\Exceptions\BusinessRuleException;
use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recording extends Model
{
    use HasFactory, HasTranslations, SoftDeletes;

    public const TYPE_SUMMARIZED = 'summarized';

    public const TYPE_DETAILED = 'detailed';

    public const TYPES = [self::TYPE_SUMMARIZED, self::TYPE_DETAILED];

    protected $fillable = [
        'code', 'description', 'segments', 'audio_path', 'duration_seconds', 'type',
        'is_general', 'plays_count', 'display_order', 'created_by',
    ];

    public array $translatable = ['description'];

    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'is_general'       => 'boolean',
            'plays_count'      => 'integer',
            'display_order'    => 'integer',
            'created_by'       => 'integer',
            'segments'         => 'array',
        ];
    }

    protected static function booted(): void
    {
        // A new recording joins the end of the library rather than jumping to
        // the front on the 0 the column defaults to, where every new row would
        // pile up in one indistinguishable block. Same append-on-create rule
        // RecordingAttachment uses for session_number.
        static::creating(function (self $r): void {
            if (! $r->display_order) {
                $r->display_order = (int) static::max('display_order') + 1;
            }
        });

        static::saving(function (self $r): void {
            if (! in_array($r->type, self::TYPES, true)) {
                $r->type = self::TYPE_SUMMARIZED;
            }

            $r->code = static::normalizeCode($r->code);

            if ($r->code !== null) {
                // Trashed recordings are excluded by the SoftDeletes scope, so a
                // deleted recording never keeps a code out of circulation.
                $duplicate = static::where('id', '!=', $r->id ?? 0)
                    ->where('code', $r->code)
                    ->exists();

                if ($duplicate) {
                    throw new BusinessRuleException("Another recording already uses the code \"{$r->code}\". Each recording's code must be unique.");
                }
            }

            foreach (['ar', 'en'] as $locale) {
                $text = trim((string) $r->getTranslation('description', $locale, false));

                if ($text === '') {
                    continue;
                }

                $duplicate = static::where('id', '!=', $r->id ?? 0)
                    ->where("description->{$locale}", $text)
                    ->exists();

                if ($duplicate) {
                    $label = $locale === 'ar' ? 'Arabic' : 'English';
                    throw new BusinessRuleException("Another recording already uses this exact {$label} description. Each recording's text must be unique.");
                }
            }
        });

        // A blank code stays blank. Codes are transcribed from the source
        // spreadsheet and nothing else is a real code: an invented `R-0007`
        // reads like one in the table and sends admins looking for a sheet row
        // that was never there. Better an empty cell that says "not coded yet".
    }

    /**
     * Codes are transcribed from the source spreadsheet, so no format is
     * imposed — Latin, Arabic and mixed codes all pass. Only surrounding and
     * repeated whitespace is tidied, and a blank code becomes null so the
     * uniqueness rule doesn't treat "" as a value two recordings can share.
     */
    public static function normalizeCode(?string $code): ?string
    {
        $code = trim((string) preg_replace('/\s+/u', ' ', (string) $code));

        return $code === '' ? null : $code;
    }

    /**
     * Every Category/Subcategory/Disease this recording is linked to.
     * Ownership/linking is managed exclusively through RecordingAttachmentService.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(RecordingAttachment::class);
    }

    public function categories(): MorphToMany
    {
        return $this->morphedByMany(Category::class, 'attachable', 'recording_attachments')
            ->using(RecordingAttachment::class)
            ->withPivot('session_number')
            ->withTimestamps();
    }

    public function subcategories(): MorphToMany
    {
        return $this->morphedByMany(Subcategory::class, 'attachable', 'recording_attachments')
            ->using(RecordingAttachment::class)
            ->withPivot('session_number')
            ->withTimestamps();
    }

    public function diseases(): MorphToMany
    {
        return $this->morphedByMany(Disease::class, 'attachable', 'recording_attachments')
            ->using(RecordingAttachment::class)
            ->withPivot('session_number')
            ->withTimestamps();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeFree(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_SUMMARIZED);
    }

    public function scopePremium(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_DETAILED);
    }

    public function scopeGeneral(Builder $query): Builder
    {
        return $query->where('is_general', true);
    }

    /**
     * The library order an admin arranged in the CMS. This orders the LIST of
     * recordings; it says nothing about playback, which follows each item's own
     * recording_attachments.session_number sequence.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('id');
    }

    public function isFreeSession(): bool
    {
        return $this->type === self::TYPE_SUMMARIZED;
    }

    /**
     * Whether the recording is reachable through the public browse tree: at
     * least one of its attached nodes (disease / subcategory / category) must
     * still be active. Guards the direct-ID endpoints so hidden content can't
     * be fetched by guessing IDs. General ruqyah recordings have their own
     * public endpoint and stay visible. A recording with no attachments at
     * all (e.g. content created but not yet linked anywhere) is not hidden by
     * anything, so it stays visible too.
     */
    public function isPubliclyVisible(): bool
    {
        if ($this->is_general) {
            return true;
        }

        $attachments = $this->relationLoaded('attachments')
            ? $this->attachments
            : $this->attachments()->with('attachable')->get();

        if ($attachments->isEmpty()) {
            return true;
        }

        foreach ($attachments as $attachment) {
            $owner = $attachment->attachable;
            if ($owner && $owner->is_active) {
                return true;
            }
        }

        return false;
    }

    public function streamUrl(): ?string
    {
        if (! $this->audio_path) {
            return null;
        }

        return url('/api/recordings/' . $this->id . '/audio');
    }

    public function canBeAccessedBy(?User $user): bool
    {
        if ($this->isFreeSession()) {
            return true;
        }

        return $user !== null && ($user->isSubscribed() || $user->hasActiveTrial());
    }
}
