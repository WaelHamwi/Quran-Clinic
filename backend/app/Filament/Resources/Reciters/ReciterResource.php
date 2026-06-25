<?php

namespace App\Filament\Resources\Reciters;

use App\Filament\Resources\Reciters\Pages;
use App\Filament\Resources\Reciters\Schemas\ReciterForm;
use App\Filament\Resources\Reciters\Tables\RecitersTable;
use App\Models\Reciter;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class ReciterResource extends Resource
{
    protected static ?string $model = Reciter::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-microphone';

    protected static string|UnitEnum|null $navigationGroup = 'Audio';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(ReciterForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(RecitersTable::getColumns())
            ->filters(RecitersTable::getFilters())
            ->actions(RecitersTable::getActions())
            ->bulkActions(RecitersTable::getBulkActions());
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListReciters::route('/'),
            'create' => Pages\CreateReciter::route('/create'),
            'edit'   => Pages\EditReciter::route('/{record}/edit'),
        ];
    }
}
