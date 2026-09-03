<?php

namespace App\Filament\Resources\Subcategories\Pages;

use App\Filament\Resources\Subcategories\SubcategoryResource;
use App\Filament\Support\RecordingLinkActions;
use Filament\Resources\Pages\ManageRecords;

class ManageSubcategories extends ManageRecords
{
    protected static string $resource = SubcategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [RecordingLinkActions::create()];
    }
}
