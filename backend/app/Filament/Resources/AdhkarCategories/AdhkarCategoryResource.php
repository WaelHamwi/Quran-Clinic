<?php

namespace App\Filament\Resources\AdhkarCategories;

use App\Filament\Resources\AdhkarCategories\Pages\ManageAdhkarCategories;
use App\Filament\Resources\AdhkarCategories\Schemas\AdhkarCategoryForm;
use App\Filament\Resources\AdhkarCategories\Tables\AdhkarCategoriesTable;
use App\Models\AdhkarCategory;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class AdhkarCategoryResource extends Resource
{
    protected static ?string $model = AdhkarCategory::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-sun';

    protected static string|UnitEnum|null $navigationGroup = 'Adhkar';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(AdhkarCategoryForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(AdhkarCategoriesTable::getColumns())
            ->filters(AdhkarCategoriesTable::getFilters())
            ->actions(AdhkarCategoriesTable::getActions())
            ->bulkActions(AdhkarCategoriesTable::getBulkActions())
            ->defaultSort('display_order');
    }

    public static function getPages(): array
    {
        return ['index' => ManageAdhkarCategories::route('/')];
    }
}
