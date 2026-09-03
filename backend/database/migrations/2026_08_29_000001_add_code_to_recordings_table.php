<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Every Ruqyah recording carries a short code that identifies it — the same
 * code the content is authored under in the source spreadsheet. It is what
 * admins recognise a recording by: recordings have no title, only a body of
 * Arabic text, so until now the only handle was the database id.
 *
 * The index is deliberately NOT unique. Recordings soft-delete, and a unique
 * constraint would let a deleted row keep hold of its code forever; the rule
 * "no two LIVE recordings share a code" is enforced on the model instead,
 * exactly as the description-uniqueness rule already is.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('recordings', 'code')) {
            Schema::table('recordings', function (Blueprint $table) {
                $table->string('code', 50)->nullable()->after('id');
                $table->index('code');
            });
        }

        $this->backfillMissingCodes();
    }

    public function down(): void
    {
        if (Schema::hasColumn('recordings', 'code')) {
            Schema::table('recordings', function (Blueprint $table) {
                $table->dropIndex(['code']);
                $table->dropColumn('code');
            });
        }
    }

    /**
     * Recordings that predate the column get the same auto-generated code a
     * blank one gets today, so no recording is ever without a handle. Admins
     * overwrite these with the spreadsheet's own codes as they go.
     */
    private function backfillMissingCodes(): void
    {
        $rows = DB::table('recordings')
            ->where(fn ($q) => $q->whereNull('code')->orWhere('code', ''))
            ->orderBy('id')
            ->pluck('id');

        foreach ($rows as $id) {
            DB::table('recordings')
                ->where('id', $id)
                ->update(['code' => sprintf('R-%04d', $id)]);
        }
    }
};
