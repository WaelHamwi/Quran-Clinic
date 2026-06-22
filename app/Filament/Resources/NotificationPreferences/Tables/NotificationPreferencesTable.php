<?php

namespace App\Filament\Resources\NotificationPreferences\Tables;

use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;

class NotificationPreferencesTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('user.name')->label('User')->searchable()->sortable(),
            IconColumn::make('adhkar_morning_enabled')->label('Morning')->boolean(),
            IconColumn::make('adhkar_evening_enabled')->label('Evening')->boolean(),
            IconColumn::make('adhkar_sleep_enabled')->label('Sleep')->boolean(),
            IconColumn::make('adhkar_waking_enabled')->label('Waking')->boolean(),
            TextColumn::make('waking_start_time')->label('Wake start')->placeholder('—'),
            TextColumn::make('waking_end_time')->label('Wake end')->placeholder('—'),
            TextColumn::make('updated_at')->label('Updated')->dateTime('d M Y, H:i')->sortable(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            TernaryFilter::make('adhkar_morning_enabled')->label('Morning adhkar'),
            TernaryFilter::make('adhkar_evening_enabled')->label('Evening adhkar'),
            TernaryFilter::make('adhkar_sleep_enabled')->label('Sleep adhkar'),
            TernaryFilter::make('adhkar_waking_enabled')->label('Waking adhkar'),
        ];
    }

    public static function getActions(): array
    {
        // View-only — preferences are managed by the user from the app.
        return [
            ViewAction::make(),
        ];
    }
}
