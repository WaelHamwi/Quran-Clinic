<?php

namespace App\Repositories;

use App\Models\Reciter;
use App\Repositories\Contracts\ReciterRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ReciterRepository implements ReciterRepositoryInterface
{
    public function allActive(): Collection
    {
        return Reciter::active()->orderBy('id')->get();
    }

    public function findById(int $id): ?Reciter
    {
        // active() keeps direct-ID lookups consistent with the index listing.
        return Reciter::active()->with(['recitations.surah'])->find($id);
    }
}
