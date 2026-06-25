<?php

namespace App\Repositories;

use App\Models\Recitation;
use App\Repositories\Contracts\RecitationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RecitationRepository implements RecitationRepositoryInterface
{
    public function getBySurahAndReciter(int $surahId, int $reciterId): ?Recitation
    {
        return Recitation::where('surah_id', $surahId)
            ->where('reciter_id', $reciterId)
            ->with(['reciter', 'surah'])
            ->first();
    }

    public function getBySurah(int $surahId): Collection
    {
        return Recitation::where('surah_id', $surahId)->with('reciter')->get();
    }

    public function getByReciter(int $reciterId): Collection
    {
        return Recitation::where('reciter_id', $reciterId)->with('surah')->get();
    }
}
