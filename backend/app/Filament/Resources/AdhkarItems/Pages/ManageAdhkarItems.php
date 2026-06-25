<?php

namespace App\Filament\Resources\AdhkarItems\Pages;

use App\Filament\Resources\AdhkarItems\AdhkarItemResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageAdhkarItems extends ManageRecords
{
    protected static string $resource = AdhkarItemResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
