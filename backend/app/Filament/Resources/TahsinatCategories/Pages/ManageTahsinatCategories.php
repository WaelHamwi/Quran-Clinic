<?php

namespace App\Filament\Resources\TahsinatCategories\Pages;

use App\Filament\Resources\TahsinatCategories\TahsinatCategoryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageTahsinatCategories extends ManageRecords
{
    protected static string $resource = TahsinatCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
