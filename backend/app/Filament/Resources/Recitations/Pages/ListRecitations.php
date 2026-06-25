<?php

namespace App\Filament\Resources\Recitations\Pages;

use App\Filament\Resources\Recitations\RecitationResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListRecitations extends ListRecords
{
    protected static string $resource = RecitationResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
