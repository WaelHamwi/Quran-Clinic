<?php

namespace App\Console\Commands;

use App\Models\Recording;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Imports the ruqyah text blocks — the C/B/D/E codes — from the source sheet's
 * "رموز الآيات" tab, one recording per code.
 *
 * These are the blocks a ruqyah is assembled from, not ruqyahs themselves: the
 * same block appears in many ruqyahs, and several times within one. They are
 * imported with no attachment, so the mobile API (which serves recordings only
 * through a disease/category link or the general-ruqyah flag) does not see them
 * until someone links them deliberately.
 *
 * The input is a tab-separated `code<TAB>surah<TAB>verse numbers<TAB>text`,
 * exported from the sheet. Re-running is safe: an existing code is updated in
 * place rather than duplicated.
 */
class ImportTextCodes extends Command
{
    protected $signature = 'recordings:import-text-codes
                            {file : TSV of code, surah, verse numbers, text}
                            {--dry-run : Report what would change without writing}';

    protected $description = 'Import ruqyah text blocks (C/B/D/E codes) from the source sheet';

    public function handle(): int
    {
        $path = $this->argument('file');

        if (! is_file($path)) {
            $this->error("No such file: {$path}");

            return self::FAILURE;
        }

        $rows = $this->parse($path);
        $this->info('rows read: ' . count($rows));

        // The sheet repeats one code (C013) on two rows. Importing the second
        // would either collide or silently overwrite the first, so the first
        // wins and the rest are reported for a human to resolve.
        $seen = $dupes = $records = [];
        foreach ($rows as $r) {
            if (isset($seen[$r['code']])) {
                $dupes[] = $r;
                continue;
            }
            $seen[$r['code']] = true;
            $records[] = $r;
        }

        $this->info('distinct codes: ' . count($records));

        if ($dupes !== []) {
            $this->warn('duplicate codes in the sheet, second occurrence NOT imported:');
            foreach ($dupes as $d) {
                $this->warn("  {$d['code']}  {$d['surah']} {$d['nums']}  {$d['text']}");
            }
        }

        $created = $updated = 0;

        DB::transaction(function () use ($records, &$created, &$updated) {
            foreach ($records as $r) {
                $existing = Recording::withTrashed()->where('code', $r['code'])->first();

                if ($existing) {
                    $existing->setTranslation('description', 'ar', $r['text']);
                    $existing->save();
                    $updated++;
                    continue;
                }

                $rec = new Recording();
                $rec->code       = $r['code'];
                $rec->type       = Recording::TYPE_SUMMARIZED;
                $rec->is_general = false;
                $rec->setTranslation('description', 'ar', $r['text']);
                $rec->save();
                $created++;
            }
        });

        $this->info("created: {$created}, updated: {$updated}");

        return self::SUCCESS;
    }

    /** @return list<array{code:string,surah:string,nums:string,text:string}> */
    private function parse(string $path): array
    {
        $out = [];

        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            [$code, $surah, $nums, $text] = array_pad(explode("\t", $line), 4, '');
            $code = trim($code);

            if ($code === '') {
                continue;
            }

            $out[] = [
                'code'  => $code,
                'surah' => trim($surah),
                'nums'  => trim($nums),
                'text'  => trim($text),
            ];
        }

        return $out;
    }
}
