<?php

namespace App\Repositories\Contracts;

use App\Models\Surah;
use Illuminate\Pagination\LengthAwarePaginator;

interface SurahRepositoryInterface
{
    public function getAllSurahs(int $perPage, int $page = 1): LengthAwarePaginator;
    public function getSurahWithVerses(int $id): ?Surah;
    public function getSurahById(int $id): ?Surah;
}
