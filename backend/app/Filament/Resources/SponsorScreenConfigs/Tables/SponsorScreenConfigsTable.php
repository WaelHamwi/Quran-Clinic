<?php

namespace App\Filament\Resources\SponsorScreenConfigs\Tables;

use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;

class SponsorScreenConfigsTable
{
    public static function getColumns(): array
    {
        return [
            IconColumn::make('is_enabled')->label('Enabled')->boolean(),
            TextColumn::make('display_duration_seconds')->label('Duration (s)'),
            TextColumn::make('sponsor.name')->label('Sponsor')->placeholder('—'),
        ];
    }

    public static function getFilters(): array
    {
        return [];
    }

    public static function getActions(): array
    {
        return [
            EditAction::make(),
        ];
    }

    public static function getBulkActions(): array
    {
        return [];
    }
}
