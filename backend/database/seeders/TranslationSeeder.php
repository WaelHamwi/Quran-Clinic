<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class TranslationSeeder extends Seeder
{
    private const SOURCE = 'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_en.json';

    public function run(): void
    {
        if (DB::table('verses')->whereNotNull('text->en')->exists()) {
            $this->command->info('English translations already seeded. Skipping.');
            return;
        }

        $localPath = __DIR__ . '/quran_en.json';

        if (file_exists($localPath)) {
            $this->command->info('Loading English translations from local file...');
            $surahs = json_decode(file_get_contents($localPath), true);
        } else {
            $this->command->info('Fetching English translations from CDN...');
            try {
                $response = Http::withOptions(['verify' => false])
                    ->timeout(60)
                    ->get(self::SOURCE);

                if (!$response->successful()) {
                    $this->command->error('Failed to fetch translations. HTTP ' . $response->status());
                    return;
                }

                $surahs = $response->json();
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                $this->command->warn('Cannot reach CDN: ' . $e->getMessage());
                $this->command->warn('Download the file manually and save it to:');
                $this->command->warn($localPath);
                return;
            }
        }

        if (empty($surahs) || !is_array($surahs)) {
            $this->command->error('Unexpected response format.');
            return;
        }

        // Build map: "surah_id_verse_number" => english translation
        $translations = [];
        foreach ($surahs as $surah) {
            foreach ($surah['verses'] as $verse) {
                $translations["{$surah['id']}_{$verse['id']}"] = $verse['translation'];
            }
        }

        $this->command->info('Loaded ' . count($translations) . ' translations. Updating verses...');

        $verses = DB::table('verses')->select(['id', 'surah_id', 'verse_number', 'text'])->get();
        $bar    = $this->command->getOutput()->createProgressBar($verses->count());

        $batch = [];
        foreach ($verses as $verse) {
            $key = "{$verse->surah_id}_{$verse->verse_number}";
            if (isset($translations[$key])) {
                $current       = json_decode($verse->text, true) ?: [];
                $current['en'] = $translations[$key];
                $batch[]       = ['id' => $verse->id, 'text' => json_encode($current, JSON_UNESCAPED_UNICODE)];
            }

            if (count($batch) >= 500) {
                $this->flush($batch);
                $batch = [];
            }

            $bar->advance();
        }

        if (!empty($batch)) {
            $this->flush($batch);
        }

        $bar->finish();
        $this->command->newLine();
        $this->command->info('English translations seeded successfully.');
    }

    private function flush(array $rows): void
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $row) {
                DB::table('verses')->where('id', $row['id'])->update(['text' => $row['text']]);
            }
        });
    }
}
