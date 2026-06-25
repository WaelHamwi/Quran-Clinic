<?php

namespace App\Filament\Resources\Verses\Tables;

use App\Models\Surah;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;

class VersesTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('surah.name')
                ->label('Surah')
                ->sortable(),
            TextColumn::make('verse_number')
                ->label('Verse #')
                ->sortable(),
            TextColumn::make('text')
                ->label('Text')
                ->getStateUsing(fn ($record) => $record->getTranslation('text', 'ar'))
                ->limit(80)
                ->searchable(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('surah_id')
                ->label('Surah')
                ->options(fn() => Surah::orderBy('id')->get()->pluck('name', 'id')->toArray())
                ->searchable(),
        ];
    }
}
