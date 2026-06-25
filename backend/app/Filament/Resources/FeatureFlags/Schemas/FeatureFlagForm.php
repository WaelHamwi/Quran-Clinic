<?php

namespace App\Filament\Resources\FeatureFlags\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

class FeatureFlagForm
{
    public static function getSchema(): array
    {
        return [
            TextInput::make('feature_key')->required()->maxLength(255)->unique(ignoreRecord: true),
            Toggle::make('is_visible')->default(true),
        ];
    }
}
