<?php

namespace App\Filament\Resources\TahsinatItems;

use App\Filament\Resources\TahsinatItems\Pages\ManageTahsinatItems;
use App\Filament\Resources\TahsinatItems\Schemas\TahsinatItemForm;
use App\Filament\Resources\TahsinatItems\Tables\TahsinatItemsTable;
use App\Models\TahsinatItem;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class TahsinatItemResource extends Resource
{
    protected static ?string $model = TahsinatItem::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-document-text';

    protected static string|UnitEnum|null $navigationGroup = 'Tahsinat';

    protected static ?int $navigationSort = 3;

    public const APPLICABILITY = [
        'self'   => 'Self (تحصين النفس)',
        'others' => 'Others (تحصين الغير)',
        'both'   => 'Both',
    ];

    public static function form(Schema $schema): Schema
    {
        return $schema->components(TahsinatItemForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(TahsinatItemsTable::getColumns())
            ->filters(TahsinatItemsTable::getFilters())
            ->actions(TahsinatItemsTable::getActions())
            ->bulkActions(TahsinatItemsTable::getBulkActions())
            ->defaultSort('display_order');
    }

    public static function getPages(): array
    {
        return ['index' => ManageTahsinatItems::route('/')];
    }
}
