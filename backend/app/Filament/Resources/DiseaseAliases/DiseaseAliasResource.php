<?php

namespace App\Filament\Resources\DiseaseAliases;

use App\Filament\Resources\DiseaseAliases\Pages\ManageDiseaseAliases;
use App\Filament\Resources\DiseaseAliases\Schemas\DiseaseAliasForm;
use App\Filament\Resources\DiseaseAliases\Tables\DiseaseAliasesTable;
use App\Models\DiseaseAlias;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class DiseaseAliasResource extends Resource
{
    protected static ?string $model = DiseaseAlias::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-tag';

    protected static string|UnitEnum|null $navigationGroup = 'Hospital';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Disease Aliases';

    public static function form(Schema $schema): Schema
    {
        return $schema->components(DiseaseAliasForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(DiseaseAliasesTable::getColumns())
            ->filters(DiseaseAliasesTable::getFilters())
            ->actions(DiseaseAliasesTable::getActions())
            ->bulkActions(DiseaseAliasesTable::getBulkActions());
    }

    public static function getPages(): array
    {
        return ['index' => ManageDiseaseAliases::route('/')];
    }
}
