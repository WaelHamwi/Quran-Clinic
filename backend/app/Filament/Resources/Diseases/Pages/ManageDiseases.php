<?php

namespace App\Filament\Resources\Diseases\Pages;

use App\Filament\Resources\Diseases\DiseaseResource;
use App\Filament\Support\RecordingLinkActions;
use Filament\Resources\Pages\ManageRecords;

class ManageDiseases extends ManageRecords
{
    protected static string $resource = DiseaseResource::class;

    protected function getHeaderActions(): array
    {
        return [RecordingLinkActions::create()];
    }
}
