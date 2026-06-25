<?php

namespace App\Repositories\Contracts;

use App\Models\SponsorScreenConfig;
use Illuminate\Support\Collection;

interface SponsorRepositoryInterface
{
    public function getAll(): Collection;

    public function screenConfig(): SponsorScreenConfig;
}
