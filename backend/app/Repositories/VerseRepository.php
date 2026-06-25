<?php

namespace App\Repositories;

use App\Models\Verse;
use App\Repositories\Contracts\VerseRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class VerseRepository implements VerseRepositoryInterface
{
    public function getVersesBySurah(int $surahId): Collection
    {
        return Verse::bySurah($surahId)->get();
    }

    public function searchVerses(string $term, int $perPage): LengthAwarePaginator
    {
        return Verse::search($term)->with('surah')->paginate($perPage);
    }

    public function getVerseByNumber(int $surahId, int $verseNumber): ?Verse
    {
        return Verse::where('surah_id', $surahId)->where('verse_number', $verseNumber)->first();
    }
}
