<?php

namespace App\Filament\Resources\DiseaseAliases\Pages;

use App\Filament\Resources\DiseaseAliases\DiseaseAliasResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageDiseaseAliases extends ManageRecords
{
    protected static string $resource = DiseaseAliasResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
