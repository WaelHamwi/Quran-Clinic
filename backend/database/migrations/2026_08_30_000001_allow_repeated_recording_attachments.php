<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A ruqyah repeats itself: the same passage opens the session, comes back in
 * the middle and closes it. The unique index allowed one link per
 * (recording, item), so that shape could not be recorded at all — an admin had
 * to choose a single place for each recording.
 *
 * Dropping it makes recording_attachments an ordered SEQUENCE rather than a
 * set: one row per occurrence, ordered by session_number, the same recording
 * free to appear at positions 1, 4 and 7.
 */
return new class extends Migration
{
    public function up(): void
    {
        // recording_id's foreign key has no index of its own — the unique one
        // starts with that column, so MySQL has been leaning on it and refuses
        // to drop it (error 1553) while it is the only cover. Give the key its
        // own index first, in its own statement, so it is in place before the
        // unique goes.
        Schema::table('recording_attachments', function (Blueprint $table): void {
            $table->index('recording_id', 'recording_attachments_recording_id_index');
        });

        Schema::table('recording_attachments', function (Blueprint $table): void {
            $table->dropUnique('recording_attachments_unique');
        });
    }

    public function down(): void
    {
        // The old schema cannot express a repeat, so restoring the index means
        // dropping every occurrence after the first — there is nowhere else for
        // them to go. Sequence order is preserved for what survives.
        $seen = [];
        $drop = [];

        DB::table('recording_attachments')
            ->orderBy('id')
            ->select('id', 'recording_id', 'attachable_type', 'attachable_id')
            ->each(function ($row) use (&$seen, &$drop): void {
                $key = $row->recording_id . '|' . $row->attachable_type . '|' . $row->attachable_id;

                if (isset($seen[$key])) {
                    $drop[] = $row->id;

                    return;
                }

                $seen[$key] = true;
            });

        if ($drop !== []) {
            DB::table('recording_attachments')->whereIn('id', $drop)->delete();
        }

        Schema::table('recording_attachments', function (Blueprint $table): void {
            $table->unique(
                ['recording_id', 'attachable_type', 'attachable_id'],
                'recording_attachments_unique',
            );
        });

        // The recording_id index stays: it is what the foreign key rests on
        // while the unique is absent, and dropping it here would only hand the
        // key back to the unique so a re-run could hit error 1553 again.
    }
};
