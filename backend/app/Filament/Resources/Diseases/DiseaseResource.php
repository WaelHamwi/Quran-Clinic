<?php

namespace App\Filament\Resources\Diseases;

use App\Filament\Resources\Diseases\Pages\ManageDiseases;
use App\Filament\Resources\Diseases\Schemas\DiseaseForm;
use App\Filament\Resources\Diseases\Tables\DiseasesTable;
use App\Models\Disease;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class DiseaseResource extends Resource
{
    protected static ?string $model = Disease::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-bug-ant';

    protected static string|UnitEnum|null $navigationGroup = 'Hospital';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(DiseaseForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(DiseasesTable::getColumns())
            ->filters(DiseasesTable::getFilters())
            ->actions(DiseasesTable::getActions())
            ->bulkActions(DiseasesTable::getBulkActions())
            ->defaultSort('display_order');
    }

    public static function getPages(): array
    {
        return ['index' => ManageDiseases::route('/')];
    }
}
