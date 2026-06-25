<?php

namespace App\Filament\Resources\Favorites;

use App\Filament\Resources\Favorites\Pages\ManageFavorites;
use App\Filament\Resources\Favorites\Schemas\FavoriteForm;
use App\Filament\Resources\Favorites\Tables\FavoritesTable;
use App\Models\Favorite;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class FavoriteResource extends Resource
{
    protected static ?string $model = Favorite::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-star';

    protected static string|UnitEnum|null $navigationGroup = 'Hospital';

    protected static ?int $navigationSort = 6;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components(FavoriteForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(FavoritesTable::getColumns())
            ->filters(FavoritesTable::getFilters())
            ->actions(FavoritesTable::getActions())
            ->bulkActions(FavoritesTable::getBulkActions())
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return ['index' => ManageFavorites::route('/')];
    }
}
