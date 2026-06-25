<?php

namespace App\Filament\Resources\Reciters\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;

class RecitersTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('name')
                ->label('Arabic Name')
                ->getStateUsing(fn ($record) => $record->getTranslation('name', 'ar'))
                ->searchable(),
            TextColumn::make('name_english')
                ->label('English Name')
                ->getStateUsing(fn ($record) => $record->getTranslation('name', 'en')),
            IconColumn::make('is_active')
                ->label('Active')
                ->boolean(),
            TextColumn::make('recitations_count')
                ->label('Recitations')
                ->counts('recitations'),
            TextColumn::make('created_at')
                ->dateTime('d M Y')
                ->sortable(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('is_active')
                ->options([
                    '1' => 'Active',
                    '0' => 'Inactive',
                ]),
        ];
    }

    public static function getActions(): array
    {
        return [
            EditAction::make(),
            DeleteAction::make(),
        ];
    }

    public static function getBulkActions(): array
    {
        return [
            BulkActionGroup::make([DeleteBulkAction::make()]),
        ];
    }
}
