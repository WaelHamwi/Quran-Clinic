<?php

namespace App\Filament\Resources\Verses;

use App\Filament\Resources\Verses\Pages;
use App\Filament\Resources\Verses\Tables\VersesTable;
use App\Models\Verse;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Tables\Table;
use UnitEnum;

class VerseResource extends Resource
{
    protected static ?string $model = Verse::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-document-text';

    protected static string|UnitEnum|null $navigationGroup = 'Quran';

    protected static ?int $navigationSort = 2;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(VersesTable::getColumns())
            ->filters(VersesTable::getFilters())
            ->actions([])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVerses::route('/'),
        ];
    }
}
