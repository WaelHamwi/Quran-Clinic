<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Clears the auto-generated `R-0007` placeholder codes.
 *
 * They were only ever a stand-in for the real code a recording carries in the
 * source spreadsheet, and they turned out to do harm: in the table they are
 * indistinguishable from a genuine code, so an admin reading `R-0108` goes
 * looking for a sheet row that does not exist. A recording with no code yet is
 * better shown as blank.
 *
 * Only the generated shape is cleared — `R-` followed by four digits and an
 * optional `-2` collision suffix. Anything an admin typed by hand is left
 * alone, even if it happens to start with "R-".
 */
return new class extends Migration
{
    public function up(): void
    {
        // Narrowed with LIKE in SQL, then matched exactly in PHP: REGEXP is a
        // MySQL extension SQLite has no answer for, and the test suite runs on
        // SQLite.
        $ids = DB::table('recordings')
            ->where('code', 'like', 'R-%')
            ->pluck('code', 'id')
            ->filter(fn (?string $code) => (bool) preg_match('/^R-\d{4}(-\d+)?$/', (string) $code))
            ->keys();

        if ($ids->isNotEmpty()) {
            DB::table('recordings')->whereIn('id', $ids)->update(['code' => null]);
        }
    }

    /**
     * Deliberately irreversible: the placeholders carried no information beyond
     * the row id, so restoring them would mean inventing the same noise again.
     */
    public function down(): void
    {
        // no-op
    }
};
