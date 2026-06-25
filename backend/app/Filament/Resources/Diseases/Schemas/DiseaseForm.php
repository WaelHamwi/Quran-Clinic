<?php

namespace App\Filament\Resources\Diseases\Schemas;

use App\Filament\Support\IconUpload;
use App\Models\Category;
use App\Models\Disease;
use App\Models\Subcategory;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Illuminate\Support\Str;

class DiseaseForm
{
    public static function getSchema(): array
    {
        return [
            Select::make('parent_type')
                ->label('Belongs To')
                ->options([
                    'subcategory' => 'A Subcategory',
                    'category'    => 'A Category directly (no subcategory)',
                ])
                ->default('subcategory')
                ->live()
                ->dehydrated(false)
                ->afterStateHydrated(function (Select $component): void {
                    $record = $component->getRecord();
                    if ($record instanceof Disease && $record->category_id) {
                        $component->state('category');
                    } else {
                        $component->state('subcategory');
                    }
                })
                ->afterStateUpdated(function (Set $set): void {
                    $set('subcategory_id', null);
                    $set('category_id', null);
                })
                ->required(),

            Select::make('subcategory_id')
                ->label('Subcategory')
                ->options(fn () => Subcategory::doesntHave('recordings')->ordered()->get()->pluck('name', 'id'))
                ->searchable()
                ->visible(fn (Get $get) => $get('parent_type') !== 'category')
                ->required(fn (Get $get) => $get('parent_type') !== 'category')
                ->helperText('Only subcategories without directly-attached recordings can have diseases.'),

            Select::make('category_id')
                ->label('Category (direct)')
                ->options(fn () => Category::where('type', 'disease_direct')->ordered()->get()->pluck('name', 'id'))
                ->searchable()
                ->visible(fn (Get $get) => $get('parent_type') === 'category')
                ->required(fn (Get $get) => $get('parent_type') === 'category')
                ->helperText('Only disease-direct categories accept diseases without a subcategory.'),

            TextInput::make('name.ar')->label('Name (Arabic)')->required()->maxLength(255),
            TextInput::make('name.en')
                ->label('Name (English)')
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state ?? ''))),
            ...IconUpload::make('diseases'),
            TextInput::make('display_order')->numeric()->default(0),
            Toggle::make('is_active')->default(true),
        ];
    }
}
