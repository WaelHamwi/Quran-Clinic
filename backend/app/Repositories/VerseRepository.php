<?php

namespace App\Repositories;

use App\Models\Verse;
use App\Repositories\Contracts\VerseRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\QueryException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class VerseRepository implements VerseRepositoryInterface
{
    public function getVersesBySurah(int $surahId): Collection
    {
        return Verse::bySurah($surahId)->get();
    }

    public function searchVerses(string $term, int $perPage): LengthAwarePaginator
    {
        try {
            return Verse::search($term)->with('surah')->paginate($perPage);
        } catch (QueryException $e) {
            // `text_norm` missing (database not yet upgraded via `verses:normalize`)
            // — fall back to the legacy per-row normalization so search never breaks.
            Log::warning('Verse text_norm search failed, falling back to legacy scan: ' . $e->getMessage());

            return Verse::searchLegacy($term)->with('surah')->paginate($perPage);
        }
    }

    public function getVerseByNumber(int $surahId, int $verseNumber): ?Verse
    {
        return Verse::where('surah_id', $surahId)->where('verse_number', $verseNumber)->first();
    }
}
