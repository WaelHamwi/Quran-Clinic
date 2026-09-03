<?php

namespace App\Repositories;

use App\Models\Surah;
use App\Repositories\Contracts\SurahRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SurahRepository implements SurahRepositoryInterface
{
    public function all(): Collection
    {
        return Surah::orderBy('id')->get();
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
