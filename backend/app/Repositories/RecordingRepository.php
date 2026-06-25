<?php

namespace App\Repositories;

use App\Models\Recording;
use App\Repositories\Contracts\RecordingRepositoryInterface;
use Illuminate\Support\Collection;

class RecordingRepository implements RecordingRepositoryInterface
{
    public function byDisease(int $diseaseId): Collection
    {
        return Recording::where('disease_id', $diseaseId)
            ->orderBy('session_number')
            ->get();
    }

    public function findById(int $id): ?Recording
    {
        return Recording::with('disease')->find($id);
    }

    public function incrementPlays(Recording $recording): void
    {
        $recording->increment('plays_count');
    }

    public function generalRuqyah(): Collection
    {
        return Recording::general()
            ->with('disease')
            ->orderBy('disease_id')
            ->orderBy('session_number')
            ->get();
    }
}
