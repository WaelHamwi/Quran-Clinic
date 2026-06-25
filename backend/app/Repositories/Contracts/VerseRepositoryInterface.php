<?php

namespace App\Repositories\Contracts;

use App\Models\Verse;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface VerseRepositoryInterface
{
    public function getVersesBySurah(int $surahId): Collection;
    public function searchVerses(string $term, int $perPage): LengthAwarePaginator;
    public function getVerseByNumber(int $surahId, int $verseNumber): ?Verse;
}
