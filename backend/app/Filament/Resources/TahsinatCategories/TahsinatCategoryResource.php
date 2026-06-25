<?php

namespace App\Filament\Resources\TahsinatCategories;

use App\Filament\Resources\TahsinatCategories\Pages\ManageTahsinatCategories;
use App\Filament\Resources\TahsinatCategories\Schemas\TahsinatCategoryForm;
use App\Filament\Resources\TahsinatCategories\Tables\TahsinatCategoriesTable;
use App\Models\TahsinatCategory;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class TahsinatCategoryResource extends Resource
{
    protected static ?string $model = TahsinatCategory::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-shield-check';

    protected static string|UnitEnum|null $navigationGroup = 'Tahsinat';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(TahsinatCategoryForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(TahsinatCategoriesTable::getColumns())
            ->filters(TahsinatCategoriesTable::getFilters())
            ->actions(TahsinatCategoriesTable::getActions())
            ->bulkActions(TahsinatCategoriesTable::getBulkActions())
            ->defaultSort('display_order');
    }

    public static function getPages(): array
    {
        return ['index' => ManageTahsinatCategories::route('/')];
    }
}
