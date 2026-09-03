<?php

namespace App\Models;

use App\Exceptions\BusinessRuleException;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphPivot;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Links a reusable Recording (text + audio) to any number of Categories,
 * Subcategories, and/or Diseases. Doubles as the pivot class for
 * Category::recordings()/Subcategory::recordings()/Disease::recordings()
 * (via ->using()) and as a directly queryable/creatable model for the
 * attach/detach flow — see RecordingAttachmentService.
 *
 * An item holds an ordered SEQUENCE of recordings, not a set: one row per
 * occurrence, played in session_number order, which RecordingAttachmentService
 * assigns from the order the admin listed them. The same recording may appear
 * several times in one item — a ruqyah routinely repeats a passage at the
 * beginning, the middle and the end — so a row is identified by its own id, and
 * (recording_id, attachable) is NOT unique. (Until Aug 2026 an item was capped
 * at one summarized + one detailed; that cap went first, the one-link-per-
 * recording unique index after it.)
 *
 * NOTE: these hooks only fire on RecordingAttachment::create()/save() — the
 * relation's attach()/sync() helpers perform raw inserts that bypass Eloquent
 * events, so writes must go through RecordingAttachmentService, never attach()/sync().
 */
class RecordingAttachment extends MorphPivot
{
    public $incrementing = true;

    protected $table = 'recording_attachments';

    protected $fillable = ['recording_id', 'attachable_type', 'attachable_id', 'session_number'];

    protected function casts(): array
    {
        return [
            'recording_id'   => 'integer',
            'attachable_id'  => 'integer',
            'session_number' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (self $a): void {
            if ($a->attachable_type === Subcategory::class) {
                $sub = Subcategory::find($a->attachable_id);
                if ($sub && ! $sub->isDirect()) {
                    throw new BusinessRuleException('This subcategory holds diseases, not recordings. Set it to "Recordings directly" first.');
                }
                if ($sub && $sub->diseases()->exists()) {
                    throw new BusinessRuleException('Cannot attach a recording directly to a subcategory that already has diseases.');
                }
            }

        });

        static::creating(function (self $a): void {
            if (! $a->session_number) {
                $max = static::where('attachable_type', $a->attachable_type)
                    ->where('attachable_id', $a->attachable_id)
                    ->max('session_number');
                $a->session_number = ($max ?? 0) + 1;
            }
        });
    }

    public function recording(): BelongsTo
    {
        return $this->belongsTo(Recording::class);
    }

    /** The Category / Subcategory / Disease this recording is attached to. */
    public function attachable(): MorphTo
    {
        return $this->morphTo();
    }
}
