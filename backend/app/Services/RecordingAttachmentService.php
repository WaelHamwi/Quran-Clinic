<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Disease;
use App\Models\Recording;
use App\Models\RecordingAttachment;
use App\Models\Subcategory;
use Illuminate\Support\Facades\DB;

/**
 * The only supported way to link/unlink a Recording and a Category/
 * Subcategory/Disease. Always goes through RecordingAttachment::create()/
 * delete() (never the relation's attach()/sync() helpers) so the business-rule
 * hooks in RecordingAttachment::booted() actually run.
 */
class RecordingAttachmentService
{
    public const ATTACHABLE_TYPES = [Category::class, Subcategory::class, Disease::class];

    public function attach(Recording $recording, string $attachableType, int $attachableId): RecordingAttachment
    {
        return RecordingAttachment::create([
            'recording_id'    => $recording->id,
            'attachable_type' => $attachableType,
            'attachable_id'   => $attachableId,
        ]);
    }

    public function detach(Recording $recording, string $attachableType, int $attachableId): void
    {
        RecordingAttachment::where('recording_id', $recording->id)
            ->where('attachable_type', $attachableType)
            ->where('attachable_id', $attachableId)
            ->delete();
    }

    /**
     * Reconciles one Category/Subcategory/Disease's links to exactly the given
     * SEQUENCE of recordings — the mirror image of sync(), used by the CMS
     * forms where the attachable is the record being edited rather than the
     * recording.
     *
     * $recordingIds is an ordered list, and a recording may appear in it more
     * than once: a ruqyah that opens, revisits and closes with the same passage
     * is three occurrences of one recording, and each gets its own row. Order
     * is what the app plays by, so position N in the list becomes
     * session_number N + 1.
     *
     * @param  list<int>  $recordingIds  ordered; repeats are meaningful, not a mistake
     */
    public function syncForAttachable(Category|Subcategory|Disease $attachable, array $recordingIds): void
    {
        $desired = array_values(array_map('intval', $recordingIds));
        $type    = $attachable::class;

        DB::transaction(function () use ($attachable, $type, $desired): void {
            // Bucketed per recording, oldest session first, so the occurrences
            // of one recording reuse the rows that already exist for it: an
            // edit that only reorders the sequence rewrites session_number
            // instead of churning every pivot row.
            $pool = RecordingAttachment::where('attachable_type', $type)
                ->where('attachable_id', $attachable->id)
                ->orderBy('session_number')
                ->get()
                ->groupBy('recording_id')
                ->map(fn ($rows): array => $rows->all())
                ->all();

            $renumbered = [];
            $created    = [];

            foreach ($desired as $position => $recordingId) {
                $sessionNumber = $position + 1;
                $row           = empty($pool[$recordingId]) ? null : array_shift($pool[$recordingId]);

                if (! $row) {
                    $created[] = ['recording_id' => $recordingId, 'session_number' => $sessionNumber];
                } elseif ($row->session_number !== $sessionNumber) {
                    $renumbered[$row->id] = $sessionNumber;
                }
            }

            // Whatever the new sequence found no place for. Deleted before the
            // new rows are written so swapping one recording for another never
            // has the item holding both at once — the business-rule hooks judge
            // each write against what is there at that moment.
            $leftover = [];

            foreach ($pool as $unclaimed) {
                foreach ($unclaimed as $orphan) {
                    $leftover[] = $orphan->id;
                }
            }

            if ($leftover !== []) {
                RecordingAttachment::whereKey($leftover)->delete();
            }

            // Column-only updates: they deliberately skip the saving() hook,
            // which has nothing to say about session_number.
            foreach ($renumbered as $id => $sessionNumber) {
                RecordingAttachment::whereKey($id)->update(['session_number' => $sessionNumber]);
            }

            foreach ($created as $new) {
                RecordingAttachment::create([
                    'recording_id'    => $new['recording_id'],
                    'attachable_type' => $type,
                    'attachable_id'   => $attachable->id,
                    'session_number'  => $new['session_number'],
                ]);
            }
        });
    }

    /**
     * Reconciles a Recording's links to exactly the given targets, grouped by
     * attachable class. Missing types are treated as "detach everything of
     * that type". Runs inside a transaction so a business-rule failure on any
     * new link rolls back the whole sync.
     *
     * This is membership, not sequence: from the recording's side the question
     * is only WHICH items it belongs to. An item that plays it three times is
     * still one item here — hence the unique() — and unticking it detaches all
     * three occurrences, which is what detach() already does. Ticking an item
     * it already appears in changes nothing, so the sequence an admin built on
     * the item's own form survives an edit from this side.
     *
     * @param  array<class-string, list<int>>  $targets
     */
    public function sync(Recording $recording, array $targets): void
    {
        DB::transaction(function () use ($recording, $targets): void {
            $current = $recording->attachments()
                ->get(['attachable_type', 'attachable_id'])
                ->groupBy('attachable_type')
                ->map(fn ($rows) => $rows->pluck('attachable_id')->unique()->all());

            foreach (self::ATTACHABLE_TYPES as $type) {
                $desired  = $targets[$type] ?? [];
                $existing = $current[$type] ?? [];

                foreach (array_diff($existing, $desired) as $removeId) {
                    $this->detach($recording, $type, (int) $removeId);
                }

                foreach (array_diff($desired, $existing) as $addId) {
                    $this->attach($recording, $type, (int) $addId);
                }
            }
        });
    }
}
