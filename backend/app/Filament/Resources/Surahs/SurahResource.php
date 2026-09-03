<?php

namespace App\Filament\Resources\Surahs;

use App\Filament\Resources\Surahs\Pages;
use App\Filament\Resources\Surahs\Tables\SurahsTable;
use App\Models\Surah;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Tables\Table;
use UnitEnum;

class SurahResource extends Resource
{
    protected static ?string $model = Surah::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-book-open';

    protected static string|UnitEnum|null $navigationGroup = 'Quran';

    protected static ?int $navigationSort = 1;

    public static function canCreate(): bool
    {
        return false;
    }

    // Hidden from the CMS sidebar for now — Surahs are read-only reference data
    // that CMS users do not need to browse. The resource still works if reached
    // directly by URL; delete this override to bring the nav item back.
    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(SurahsTable::getColumns())
            ->filters(SurahsTable::getFilters())
            ->actions(SurahsTable::getActions())
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSurahs::route('/'),
        ];
    }
}
