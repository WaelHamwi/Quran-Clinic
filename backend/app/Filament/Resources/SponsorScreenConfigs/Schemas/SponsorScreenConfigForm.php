<?php

namespace App\Filament\Resources\SponsorScreenConfigs\Schemas;

use App\Models\Sponsor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

class SponsorScreenConfigForm
{
    public static function getSchema(): array
    {
        return [
            Toggle::make('is_enabled')->label('Show sponsor splash screen')->default(true),
            TextInput::make('display_duration_seconds')
                ->numeric()
                ->minValue(1)
                ->default(3)
                ->required(),
            Select::make('selected_sponsor_id')
                ->label('Sponsor to display')
                ->options(fn () => Sponsor::ordered()->get()->pluck('name', 'id'))
                ->searchable(),
        ];
    }
}
