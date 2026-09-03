<?php

namespace App\Console\Commands;

use App\Models\Verse;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * In-place upgrade for existing databases (no migration needed): adds the
 * `verses.text_norm` column when absent and backfills it from the Arabic text.
 * Fresh databases get the column from the verses migration and the values from
 * the seeder / model saving hook — running this there is a fast no-op.
 * Idempotent; safe to re-run.
 */
class NormalizeVersesCommand extends Command
{
    protected $signature = 'verses:normalize
        {--force : Recompute every row, not just rows where text_norm is NULL}';

    protected $description = 'Add + backfill verses.text_norm (pre-normalized Arabic) so verse search is a plain LIKE';

    public function handle(): int
    {
        if (! Schema::hasColumn('verses', 'text_norm')) {
            $this->info('Adding verses.text_norm column…');
            Schema::table('verses', function ($table) {
                $table->text('text_norm')->nullable();
            });
        }

        $query = DB::table('verses');
        if (! $this->option('force')) {
            $query->whereNull('text_norm');
        }

        $total = 0;
        // orderBy + chunkById on the PK keeps the scan stable while rows are updated.
        $query->orderBy('id')->chunkById(500, function ($rows) use (&$total) {
            foreach ($rows as $row) {
                $text = json_decode((string) $row->text, true);
                $ar   = is_array($text) ? ($text['ar'] ?? '') : '';

                DB::table('verses')->where('id', $row->id)->update([
                    'text_norm' => $ar === '' ? null : Verse::normalizeArabic($ar),
                ]);
                $total++;
            }
        });

        $this->info("Normalized {$total} verse(s).");

        return self::SUCCESS;
    }
}
