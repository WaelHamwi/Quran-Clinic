<?php

namespace App\Filament\Resources\Subcategories\Schemas;

use App\Filament\Support\IconUpload;
use App\Models\Category;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Set;
use Illuminate\Support\Str;

class SubcategoryForm
{
    public static function getSchema(): array
    {
        return [
            Select::make('category_id')
                ->label('Category')
                ->options(fn () => Category::where('type', 'standard')->ordered()->get()->pluck('name', 'id'))
                ->searchable()
                ->required()
                ->helperText('Only standard-type categories can have subcategories.'),
            TextInput::make('name.ar')->label('Name (Arabic)')->required()->maxLength(255),
            TextInput::make('name.en')
                ->label('Name (English)')
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state ?? ''))),
            ...IconUpload::make('subcategories'),
            TextInput::make('display_order')->numeric()->default(0),
            Toggle::make('is_active')->default(true),
        ];
    }
}
