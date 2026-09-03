<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Backfills recording_attachments from the legacy single-owner columns on
 * `recordings` (disease_id / category_id / subcategory_id / session_number).
 * The legacy columns are left untouched — they are simply no longer read by
 * the application after this release, kept only as a rollback safety net.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('recordings')
            ->select('id', 'disease_id', 'category_id', 'subcategory_id', 'session_number')
            ->where(function ($query): void {
                // Grouped so chunkById's own "AND id > ?" cursor clause ANDs against
                // the whole OR set below, not just the last orWhereNotNull() term.
                $query->whereNotNull('disease_id')
                    ->orWhereNotNull('category_id')
                    ->orWhereNotNull('subcategory_id');
            })
            ->chunkById(500, function ($rows): void {
                $now = now();
                $inserts = [];

                // Idempotency used to come free from the unique index on
                // (recording, attachable); repeats are legal now, so re-running
                // this would append a second copy of every legacy link. The
                // guard has to be explicit.
                $alreadyLinked = DB::table('recording_attachments')
                    ->whereIn('recording_id', $rows->pluck('id'))
                    ->get(['recording_id', 'attachable_type', 'attachable_id'])
                    ->keyBy(fn ($link): string => $link->recording_id . '|' . $link->attachable_type . '|' . $link->attachable_id);

                foreach ($rows as $row) {
                    [$type, $attachableId] = match (true) {
                        (bool) $row->disease_id     => ['App\\Models\\Disease', $row->disease_id],
                        (bool) $row->subcategory_id => ['App\\Models\\Subcategory', $row->subcategory_id],
                        (bool) $row->category_id    => ['App\\Models\\Category', $row->category_id],
                        default                     => [null, null],
                    };

                    if ($type === null) {
                        continue;
                    }

                    if ($alreadyLinked->has($row->id . '|' . $type . '|' . $attachableId)) {
                        continue;
                    }

                    $inserts[] = [
                        'recording_id'    => $row->id,
                        'attachable_type' => $type,
                        'attachable_id'   => $attachableId,
                        'session_number'  => $row->session_number ?? 1,
                        'created_at'      => $now,
                        'updated_at'      => $now,
                    ];
                }

                if ($inserts !== []) {
                    DB::table('recording_attachments')->insertOrIgnore($inserts);
                }
            });
    }

    public function down(): void
    {
        DB::table('recording_attachments')->truncate();
    }
};
