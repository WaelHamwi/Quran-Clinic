<?php

namespace App\Filament\Resources\AdhkarItems;

use App\Filament\Resources\AdhkarItems\Pages\ManageAdhkarItems;
use App\Filament\Resources\AdhkarItems\Schemas\AdhkarItemForm;
use App\Filament\Resources\AdhkarItems\Tables\AdhkarItemsTable;
use App\Models\AdhkarItem;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class AdhkarItemResource extends Resource
{
    protected static ?string $model = AdhkarItem::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-list-bullet';

    protected static string|UnitEnum|null $navigationGroup = 'Adhkar';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(AdhkarItemForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(AdhkarItemsTable::getColumns())
            ->filters(AdhkarItemsTable::getFilters())
            ->actions(AdhkarItemsTable::getActions())
            ->bulkActions(AdhkarItemsTable::getBulkActions())
            ->defaultSort('display_order');
    }

    public static function getPages(): array
    {
        return ['index' => ManageAdhkarItems::route('/')];
    }
}
