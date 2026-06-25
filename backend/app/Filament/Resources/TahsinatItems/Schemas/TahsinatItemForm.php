<?php

namespace App\Filament\Resources\TahsinatItems\Schemas;

use App\Filament\Resources\TahsinatItems\TahsinatItemResource;
use App\Models\TahsinatCategory;
use App\Models\TahsinatSection;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;

class TahsinatItemForm
{
    public static function getSchema(): array
    {
        return [
            Select::make('tahsinat_category_id')
                ->label('Category')
                ->options(fn () => TahsinatCategory::ordered()->get()->pluck('name', 'id'))
                ->helperText('Self-Fortification or Fortification for Others.')
                ->searchable()
                ->required()
                ->live()
                ->afterStateUpdated(fn (Set $set) => $set('tahsinat_section_id', null)),
            Select::make('tahsinat_section_id')
                ->label('Section (optional)')
                ->options(fn (Get $get) => $get('tahsinat_category_id')
                    ? TahsinatSection::where('tahsinat_category_id', $get('tahsinat_category_id'))
                        ->ordered()->get()->pluck('name', 'id')
                    : [])
                ->helperText('Group this item under a sub-section of the category.')
                ->searchable(),
            Select::make('applicability')
                ->label('Applicability')
                ->options(TahsinatItemResource::APPLICABILITY)
                ->default('both')
                ->required(),
            TextInput::make('label.ar')->label('Label (Arabic)')->maxLength(255),
            TextInput::make('label.en')->label('Label (English)')->maxLength(255),
            Textarea::make('text.ar')->label('Text (Arabic)')->rows(3),
            Textarea::make('text.en')->label('Text (English)')->rows(3),
            TextInput::make('repetitions')->numeric()->minValue(1)->default(1)->required()
                ->helperText('How many times this should be repeated.'),
            Textarea::make('hint.ar')->label('Hint (Arabic)')->rows(2)
                ->helperText('Helpful explanation shown to the user.'),
            Textarea::make('hint.en')->label('Hint (English)')->rows(2),
            TextInput::make('display_order')->numeric()->default(0)
                ->helperText('Manual sequence number within the section (1, 2, 3...).'),
        ];
    }
}
