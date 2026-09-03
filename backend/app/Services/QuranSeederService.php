<?php

namespace App\Services;

use App\Models\Surah;
use App\Models\Verse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuranSeederService
{
    public function fetchFromUrl(string $url): array
    {
        $response = Http::withOptions(['verify' => true])->timeout(60)->get($url);

        if (!$response->successful()) {
            throw new \RuntimeException("Failed to fetch Quran data. Status: {$response->status()}");
        }

        return $response->json();
    }

    public function parseJson(array $data): array
    {
        return array_map(function (array $surah) {
            return [
                'id'              => $surah['id'],
                'name'            => ['ar' => $surah['name'], 'en' => $surah['transliteration']],
                'transliteration' => $surah['transliteration'],
                'type'            => strtolower($surah['type']),
                'total_verses'    => $surah['total_verses'],
                'verses'          => $surah['verses'],
            ];
        }, $data);
    }

    public function insertSurahs(array $surahs): void
    {
        foreach ($surahs as $surahData) {
            $surah = Surah::create([
                'name'            => $surahData['name'],
                'transliteration' => $surahData['transliteration'],
                'type'            => $surahData['type'],
                'total_verses'    => $surahData['total_verses'],
            ]);

            $this->insertVerses($surah->id, $surahData['verses']);

            Log::info("Seeded surah: {$surahData['transliteration']} ({$surahData['total_verses']} verses)");
        }
    }

    public function insertVerses(int $surahId, array $verses): void
    {
        $now = now()->toDateTimeString();

        $rows = array_map(function (array $verse, int $index) use ($surahId, $now) {
            return [
                'surah_id'     => $surahId,
                'verse_number' => $index + 1,
                'text'         => json_encode(['ar' => $verse['text']], JSON_UNESCAPED_UNICODE),
                // Bulk insert bypasses model events, so the normalized search
                // column (kept in sync by Verse::saving elsewhere) is filled here.
                'text_norm'    => Verse::normalizeArabic($verse['text']),
                'created_at'   => $now,
                'updated_at'   => $now,
            ];
        }, $verses, array_keys($verses));

        foreach (array_chunk($rows, 500) as $chunk) {
            Verse::insert($chunk);
        }
    }
}
