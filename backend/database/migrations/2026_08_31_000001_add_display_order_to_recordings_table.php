<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Gives recordings a curated order of their own, so the library can be arranged
 * by hand in the CMS instead of falling back to whenever a row happened to be
 * created.
 *
 * This is the order of the LIBRARY, not of playback: what plays, and in what
 * order, is recording_attachments.session_number, which is per item and
 * untouched here.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recordings', function (Blueprint $table): void {
            $table->unsignedInteger('display_order')->default(0)->after('plays_count');
            $table->index('display_order', 'recordings_display_order_index');
        });

        // Seeded in id order — the order the recording picker already lists
        // them in — so turning the table over to a curated order on the next
        // request does not silently reshuffle a library nobody has arranged yet.
        $position = 0;

        DB::table('recordings')
            ->orderBy('id')
            ->select('id')
            ->chunk(500, function ($rows) use (&$position): void {
                foreach ($rows as $row) {
                    DB::table('recordings')
                        ->where('id', $row->id)
                        ->update(['display_order' => ++$position]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('recordings', function (Blueprint $table): void {
            $table->dropIndex('recordings_display_order_index');
            $table->dropColumn('display_order');
        });
    }
};
