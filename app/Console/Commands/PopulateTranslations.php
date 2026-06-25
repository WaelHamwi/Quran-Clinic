<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class PopulateTranslations extends Command
{
    protected $signature = 'quran:add-translations';
    protected $description = 'Populate English translations for all verses from quran-json CDN';

    private const SOURCE = 'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_en.json';

    public function handle(): int
    {
        $this->info('Fetching English translations from jsdelivr CDN...');

        $response = Http::withOptions(['verify' => true])
            ->timeout(60)
            ->get(self::SOURCE);

        if (!$response->successful()) {
            $this->error('Failed to fetch translations. HTTP ' . $response->status());
            return self::FAILURE;
        }

        $surahs = $response->json();

        if (empty($surahs) || !is_array($surahs)) {
            $this->error('Unexpected response format from CDN.');
            return self::FAILURE;
        }

        $this->info('Parsing ' . count($surahs) . ' surahs...');

        // Build map: "surah_id_verse_number" => english text
        // quran_en.json structure: [ { id, verses: [ { id, text }, ... ] }, ... ]
        $translations = [];
        foreach ($surahs as $surah) {
            $surahId = $surah['id'];
            foreach ($surah['verses'] as $verse) {
                $translations["{$surahId}_{$verse['id']}"] = $verse['text'];
            }
        }

        $this->info('Built ' . count($translations) . ' translation entries.');
        $this->info('Loading verses from database...');

        $verses = DB::table('verses')->select(['id', 'surah_id', 'verse_number', 'text'])->get();
        $total  = $verses->count();

        $this->info("Updating {$total} verses...");
        $bar = $this->output->createProgressBar($total);

        $batch = [];
        foreach ($verses as $verse) {
            $key = "{$verse->surah_id}_{$verse->verse_number}";
            if (!isset($translations[$key])) {
                $bar->advance();
                continue;
            }

            $current       = json_decode($verse->text, true) ?: [];
            $current['en'] = $translations[$key];

            $batch[] = [
                'id'   => $verse->id,
                'text' => json_encode($current, JSON_UNESCAPED_UNICODE),
            ];

            // Upsert in chunks of 500 for performance
            if (count($batch) >= 500) {
                $this->upsertBatch($batch);
                $batch = [];
            }

            $bar->advance();
        }

        if (!empty($batch)) {
            $this->upsertBatch($batch);
        }

        $bar->finish();
        $this->newLine();

        $this->info('Flushing cache...');
        Cache::flush();

        $this->info('Done! English translations populated successfully.');
        return self::SUCCESS;
    }

    private function upsertBatch(array $rows): void
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $row) {
                DB::table('verses')
                    ->where('id', $row['id'])
                    ->update(['text' => $row['text']]);
            }
        });
    }
}
