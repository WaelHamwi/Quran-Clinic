<?php

namespace App\Filament\Resources\TahsinatItems\Pages;

use App\Filament\Resources\TahsinatItems\TahsinatItemResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageTahsinatItems extends ManageRecords
{
    protected static string $resource = TahsinatItemResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
