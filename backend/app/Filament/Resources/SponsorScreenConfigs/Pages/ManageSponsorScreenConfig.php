<?php

namespace App\Filament\Resources\SponsorScreenConfigs\Pages;

use App\Filament\Resources\SponsorScreenConfigs\SponsorScreenConfigResource;
use App\Models\SponsorScreenConfig;
use Filament\Resources\Pages\ManageRecords;

class ManageSponsorScreenConfig extends ManageRecords
{
    protected static string $resource = SponsorScreenConfigResource::class;

    public function mount(): void
    {
        parent::mount();

        SponsorScreenConfig::current();
    }
}
