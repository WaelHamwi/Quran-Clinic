<?php

namespace App\Filament\Resources\Sponsors;

use App\Filament\Resources\Sponsors\Pages\ManageSponsors;
use App\Filament\Resources\Sponsors\Schemas\SponsorForm;
use App\Filament\Resources\Sponsors\Tables\SponsorsTable;
use App\Models\Sponsor;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class SponsorResource extends Resource
{
    protected static ?string $model = Sponsor::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-megaphone';

    protected static string|UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(SponsorForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(SponsorsTable::getColumns())
            ->filters(SponsorsTable::getFilters())
            ->actions(SponsorsTable::getActions())
            ->bulkActions(SponsorsTable::getBulkActions())
            ->defaultSort('display_order');
    }

    public static function getPages(): array
    {
        return ['index' => ManageSponsors::route('/')];
    }
}
