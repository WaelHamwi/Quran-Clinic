<?php

namespace App\Filament\Resources\Sponsors\Pages;

use App\Filament\Resources\Sponsors\SponsorResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageSponsors extends ManageRecords
{
    protected static string $resource = SponsorResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
