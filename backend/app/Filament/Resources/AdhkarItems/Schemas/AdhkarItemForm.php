<?php

namespace App\Filament\Resources\AdhkarItems\Schemas;

use App\Models\AdhkarCategory;
use App\Models\AdhkarSection;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;

class AdhkarItemForm
{
    public static function getSchema(): array
    {
        return [
            Select::make('adhkar_category_id')
                ->label('Category')
                ->options(fn () => AdhkarCategory::ordered()->get()->pluck('name', 'id'))
                ->helperText('Morning, Evening, Sleep or Waking.')
                ->searchable()
                ->required()
                ->live()
                ->afterStateUpdated(fn (Set $set) => $set('adhkar_section_id', null)),
            Select::make('adhkar_section_id')
                ->label('Section (optional)')
                ->options(fn (Get $get) => $get('adhkar_category_id')
                    ? AdhkarSection::where('adhkar_category_id', $get('adhkar_category_id'))
                        ->ordered()->get()->pluck('name', 'id')
                    : [])
                ->helperText('Group this item under a sub-section of the category.')
                ->searchable(),
            Textarea::make('text.ar')->label('Text (Arabic)')->rows(3),
            Textarea::make('text.en')->label('Text (English)')->rows(3),
            FileUpload::make('image')
                ->label('Image (optional)')
                ->image()
                ->disk('public')
                ->directory('adhkar-items')
                ->maxSize(2048)
                ->helperText('Optional — an item may carry text, an image, or both. Use an image for calligraphy or illustrated dhikr.'),
            TextInput::make('repetitions')->numeric()->minValue(1)->default(1)->required()
                ->helperText('How many times this dhikr should be repeated.'),
            Textarea::make('hint.ar')->label('Hint (Arabic)')->rows(2)
                ->helperText('Helpful explanation shown to the user.'),
            Textarea::make('hint.en')->label('Hint (English)')->rows(2),
            Textarea::make('daleel.ar')->label('Daleel / Source (Arabic)')->rows(2),
            Textarea::make('daleel.en')->label('Daleel / Source (English)')->rows(2),
            TextInput::make('display_order')->numeric()->default(0)
                ->helperText('Manual sequence number within the section (1, 2, 3...).'),
        ];
    }
}
