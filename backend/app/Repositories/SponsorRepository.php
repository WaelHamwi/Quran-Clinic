<?php

namespace App\Repositories;

use App\Models\Sponsor;
use App\Models\SponsorScreenConfig;
use App\Repositories\Contracts\SponsorRepositoryInterface;
use Illuminate\Support\Collection;

class SponsorRepository implements SponsorRepositoryInterface
{
    public function getAll(): Collection
    {
        return Sponsor::active()->ordered()->get();
    }

    public function screenConfig(): SponsorScreenConfig
    {
        return SponsorScreenConfig::current()->load('sponsor');
    }
}
