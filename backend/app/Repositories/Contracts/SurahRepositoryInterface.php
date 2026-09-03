<?php

namespace App\Repositories\Contracts;

use App\Models\Surah;
use Illuminate\Database\Eloquent\Collection;

interface SurahRepositoryInterface
{
    public function all(): Collection;
    public function getSurahWithVerses(int $id): ?Surah;
    public function getSurahById(int $id): ?Surah;
}
