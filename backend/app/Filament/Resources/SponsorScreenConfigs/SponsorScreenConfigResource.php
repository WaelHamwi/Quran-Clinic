<?php

namespace App\Filament\Resources\SponsorScreenConfigs;

use App\Filament\Resources\SponsorScreenConfigs\Pages\ManageSponsorScreenConfig;
use App\Filament\Resources\SponsorScreenConfigs\Schemas\SponsorScreenConfigForm;
use App\Filament\Resources\SponsorScreenConfigs\Tables\SponsorScreenConfigsTable;
use App\Models\SponsorScreenConfig;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class SponsorScreenConfigResource extends Resource
{
    protected static ?string $model = SponsorScreenConfig::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-presentation-chart-bar';

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Sponsor Screen';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components(SponsorScreenConfigForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(SponsorScreenConfigsTable::getColumns())
            ->filters(SponsorScreenConfigsTable::getFilters())
            ->actions(SponsorScreenConfigsTable::getActions())
            ->bulkActions(SponsorScreenConfigsTable::getBulkActions());
    }

    public static function getPages(): array
    {
        return ['index' => ManageSponsorScreenConfig::route('/')];
    }
}
