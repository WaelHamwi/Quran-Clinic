<?php

namespace App\Filament\Resources\TahsinatSections\Pages;

use App\Filament\Resources\TahsinatSections\TahsinatSectionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageTahsinatSections extends ManageRecords
{
    protected static string $resource = TahsinatSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
