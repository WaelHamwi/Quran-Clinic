<?php

namespace App\Repositories\Contracts;

use App\Models\Recitation;
use Illuminate\Database\Eloquent\Collection;

interface RecitationRepositoryInterface
{
    public function getBySurahAndReciter(int $surahId, int $reciterId): ?Recitation;
    public function getBySurah(int $surahId): Collection;
    public function getByReciter(int $reciterId): Collection;
}
