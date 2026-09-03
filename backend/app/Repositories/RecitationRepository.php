<?php

namespace App\Repositories;

use App\Models\Recitation;
use App\Repositories\Contracts\RecitationRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class RecitationRepository implements RecitationRepositoryInterface
{
    public function all(): Collection
    {
        return Recitation::whereHas('reciter', $this->reciterActive())
            ->with('reciter')
            ->orderBy('surah_id')
            ->get();
    }

    public function findById(int $id): ?Recitation
    {
        return Recitation::whereHas('reciter', $this->reciterActive())->find($id);
    }

    public function getBySurahAndReciter(int $surahId, int $reciterId): ?Recitation
    {
        return Recitation::where('surah_id', $surahId)
            ->where('reciter_id', $reciterId)
            ->whereHas('reciter', $this->reciterActive())
            ->with(['reciter', 'surah'])
            ->first();
    }

    public function getBySurah(int $surahId): Collection
    {
        return Recitation::where('surah_id', $surahId)
            ->whereHas('reciter', $this->reciterActive())
            ->with('reciter')
            ->get();
    }

    public function getByReciter(int $reciterId): Collection
    {
        return Recitation::where('reciter_id', $reciterId)
            ->whereHas('reciter', $this->reciterActive())
            ->with('surah')
            ->get();
    }

    /** Recitations of deactivated reciters are hidden everywhere, including direct-ID access. */
    private function reciterActive(): \Closure
    {
        return fn (Builder $q) => $q->where('is_active', true);
    }
}
