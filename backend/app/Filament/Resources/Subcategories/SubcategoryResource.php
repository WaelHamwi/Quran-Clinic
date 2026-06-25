<?php

namespace App\Filament\Resources\Subcategories;

use App\Filament\Resources\Subcategories\Pages\ManageSubcategories;
use App\Filament\Resources\Subcategories\Schemas\SubcategoryForm;
use App\Filament\Resources\Subcategories\Tables\SubcategoriesTable;
use App\Models\Subcategory;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class SubcategoryResource extends Resource
{
    protected static ?string $model = Subcategory::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-squares-2x2';

    protected static string|UnitEnum|null $navigationGroup = 'Hospital';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(SubcategoryForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(SubcategoriesTable::getColumns())
            ->filters(SubcategoriesTable::getFilters())
            ->actions(SubcategoriesTable::getActions())
            ->bulkActions(SubcategoriesTable::getBulkActions())
            ->defaultSort('display_order');
    }

    public static function getPages(): array
    {
        return ['index' => ManageSubcategories::route('/')];
    }
}
