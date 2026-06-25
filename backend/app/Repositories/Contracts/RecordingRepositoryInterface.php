<?php

namespace App\Repositories\Contracts;

use App\Models\Recording;
use Illuminate\Support\Collection;

interface RecordingRepositoryInterface
{
    public function byDisease(int $diseaseId): Collection;

    public function findById(int $id): ?Recording;

    public function incrementPlays(Recording $recording): void;

    public function generalRuqyah(): Collection;
}
