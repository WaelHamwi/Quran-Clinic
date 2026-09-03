<?php

namespace App\Repositories;

use App\Models\Disease;
use App\Models\Recording;
use App\Repositories\Contracts\RecordingRepositoryInterface;
use Illuminate\Support\Collection;

class RecordingRepository implements RecordingRepositoryInterface
{
    public function byDisease(int $diseaseId): Collection
    {
        // Only recordings of active diseases: keeps direct-ID listing in line with
        // the active()-scoped browse tree so hidden content can't be enumerated.
        $disease = Disease::where('id', $diseaseId)->where('is_active', true)->first();

        return $disease?->recordings ?? collect();
    }

    public function findById(int $id): ?Recording
    {
        return Recording::with('attachments.attachable')->find($id);
    }

    public function incrementPlays(Recording $recording): void
    {
        $recording->increment('plays_count');
    }

    public function generalRuqyah(): Collection
    {
        return Recording::general()
            ->with('attachments.attachable')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();
    }
}
