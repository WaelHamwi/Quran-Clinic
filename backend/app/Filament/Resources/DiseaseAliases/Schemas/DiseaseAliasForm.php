<?php

namespace App\Filament\Resources\DiseaseAliases\Schemas;

use App\Models\Disease;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;

class DiseaseAliasForm
{
    public static function getSchema(): array
    {
        return [
            Select::make('disease_id')
                ->label('Disease')
                ->options(fn () => Disease::ordered()->get()->pluck('name', 'id'))
                ->searchable()
                ->required(),
            TextInput::make('alias.ar')->label('Alias (Arabic)')->required()->maxLength(255),
            TextInput::make('alias.en')->label('Alias (English)')->required()->maxLength(255),
        ];
    }
}
