<?php

namespace App\Repositories;

use App\Models\Surah;
use App\Repositories\Contracts\SurahRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class SurahRepository implements SurahRepositoryInterface
{
    public function getAllSurahs(int $perPage, int $page = 1): LengthAwarePaginator
    {
        return Surah::orderBy('id')->paginate($perPage, ['*'], 'page', $page);
    }

    public function getSurahWithVerses(int $id): ?Surah
    {
        return Surah::with(['verses' => fn($q) => $q->orderBy('verse_number')])->find($id);
    }

    public function getSurahById(int $id): ?Surah
    {
        return Surah::find($id);
    }
}
