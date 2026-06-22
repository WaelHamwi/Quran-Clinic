<?php

namespace App\Filament\Resources\NotificationPreferences\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

class NotificationPreferenceForm
{
    public static function getSchema(): array
    {
        // Read-only view — everything is disabled and not dehydrated.
        return [
            TextInput::make('user.name')
                ->label('User')
                ->disabled()
                ->dehydrated(false),
            Toggle::make('adhkar_morning_enabled')->label('Morning adhkar')->disabled()->dehydrated(false),
            Toggle::make('adhkar_evening_enabled')->label('Evening adhkar')->disabled()->dehydrated(false),
            Toggle::make('adhkar_sleep_enabled')->label('Sleep adhkar')->disabled()->dehydrated(false),
            Toggle::make('adhkar_waking_enabled')->label('Waking adhkar')->disabled()->dehydrated(false),
            TextInput::make('waking_start_time')->label('Waking window start')->disabled()->dehydrated(false),
            TextInput::make('waking_end_time')->label('Waking window end')->disabled()->dehydrated(false),
        ];
    }
}
