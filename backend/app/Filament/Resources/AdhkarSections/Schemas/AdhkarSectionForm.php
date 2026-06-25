<?php

namespace App\Filament\Resources\AdhkarSections\Schemas;

use App\Models\AdhkarCategory;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

class AdhkarSectionForm
{
    public static function getSchema(): array
    {
        return [
            Select::make('adhkar_category_id')
                ->label('Adhkar Category')
                ->options(fn () => AdhkarCategory::ordered()->get()->pluck('name', 'id'))
                ->searchable()
                ->required(),
            TextInput::make('name.ar')->label('Name (Arabic)')->required()->maxLength(255),
            TextInput::make('name.en')->label('Name (English)')->required()->maxLength(255),
            Toggle::make('order_randomly')
                ->label('Order Randomly')
                ->helperText('When on, this section\'s items are shuffled into a random order every time it is viewed. When off, items follow their manual sequence number.'),
            TextInput::make('display_order')->numeric()->default(0),
        ];
    }
}
