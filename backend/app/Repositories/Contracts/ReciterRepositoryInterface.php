<?php

namespace App\Repositories\Contracts;

use App\Models\Reciter;
use Illuminate\Database\Eloquent\Collection;

interface ReciterRepositoryInterface
{
    public function allActive(): Collection;
    public function findById(int $id): ?Reciter;
}
