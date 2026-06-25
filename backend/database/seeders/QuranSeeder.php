<?php

namespace Database\Seeders;

use App\Models\Surah;
use App\Services\QuranSeederService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuranSeeder extends Seeder
{
    public function run(): void
    {
        ini_set('memory_limit', '256M');

        if (Surah::count() > 0) {
            $this->command->info('Quran already seeded. Skipping.');
            return;
        }

        $service = app(QuranSeederService::class);

        $this->command->info('Fetching Quran data...');

        DB::transaction(function () use ($service) {
            $raw    = $service->fetchFromUrl('https://cdn.jsdelivr.net/npm/quran-cloud@1.0.0/dist/quran.json');
            $parsed = $service->parseJson($raw);
            $service->insertSurahs($parsed);
        });

        $surahCount = Surah::count();
        $verseCount = \App\Models\Verse::count();

        Log::info("QuranSeeder complete. Surahs: {$surahCount}, Verses: {$verseCount}");
        $this->command->info("Done. {$surahCount} surahs and {$verseCount} verses inserted.");
    }
}
