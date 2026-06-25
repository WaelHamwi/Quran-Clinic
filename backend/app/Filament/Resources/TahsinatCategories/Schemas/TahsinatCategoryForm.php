<?php

namespace App\Filament\Resources\TahsinatCategories\Schemas;

use App\Filament\Support\IconUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

class TahsinatCategoryForm
{
    public static function getSchema(): array
    {
        return [
            TextInput::make('name.ar')->label('Name (Arabic)')->required()->maxLength(255),
            TextInput::make('name.en')->label('Name (English)')->required()->maxLength(255),
            TextInput::make('slug')->required()->maxLength(255)->unique(ignoreRecord: true)
                ->helperText('e.g. "self" (Self-Fortification) or "others" (Fortification for Others).'),
            ...IconUpload::make('tahsinat-categories'),
            TextInput::make('display_order')->numeric()->default(0),
            Toggle::make('is_active')->default(true),
        ];
    }
}
