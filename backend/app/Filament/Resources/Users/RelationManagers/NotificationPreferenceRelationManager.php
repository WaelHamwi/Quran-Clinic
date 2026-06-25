<?php

namespace App\Filament\Resources\Users\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class NotificationPreferenceRelationManager extends RelationManager
{
    protected static string $relationship = 'notificationPreference';

    protected static ?string $title = 'Notification preferences';

    public function table(Table $table): Table
    {
        // HasOne → a single row showing the user's adhkar reminder choices.
        return $table
            ->columns([
                IconColumn::make('adhkar_morning_enabled')->label('Morning')->boolean(),
                IconColumn::make('adhkar_evening_enabled')->label('Evening')->boolean(),
                IconColumn::make('adhkar_sleep_enabled')->label('Sleep')->boolean(),
                IconColumn::make('adhkar_waking_enabled')->label('Waking')->boolean(),
                TextColumn::make('waking_start_time')->label('Wake start')->placeholder('—'),
                TextColumn::make('waking_end_time')->label('Wake end')->placeholder('—'),
                TextColumn::make('updated_at')->label('Updated')->dateTime('d M Y, H:i'),
            ]);
    }
}
