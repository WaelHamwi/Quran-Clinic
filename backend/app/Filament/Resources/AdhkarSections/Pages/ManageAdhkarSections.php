<?php

namespace App\Filament\Resources\AdhkarSections\Pages;

use App\Filament\Resources\AdhkarSections\AdhkarSectionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageAdhkarSections extends ManageRecords
{
    protected static string $resource = AdhkarSectionResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
