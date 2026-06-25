<?php

namespace App\Filament\Resources\Surahs\Tables;

use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;

class SurahsTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('id')
                ->label('No.')
                ->sortable(),
            TextColumn::make('name')
                ->label('Arabic Name')
                ->getStateUsing(fn ($record) => $record->getTranslation('name', 'ar'))
                ->searchable(),
            TextColumn::make('transliteration')
                ->label('English Name')
                ->searchable(),
            TextColumn::make('type')
                ->badge()
                ->color(fn(string $state): string => $state === 'meccan' ? 'success' : 'info'),
            TextColumn::make('total_verses')
                ->label('Verses')
                ->sortable(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('type')
                ->options([
                    'meccan'  => 'Meccan',
                    'medinan' => 'Medinan',
                ]),
        ];
    }

    public static function getActions(): array
    {
        return [];
    }
}
