<?php

namespace App\Filament\Resources\Favorites\Pages;

use App\Filament\Resources\Favorites\FavoriteResource;
use Filament\Resources\Pages\ManageRecords;

class ManageFavorites extends ManageRecords
{
    protected static string $resource = FavoriteResource::class;
}
