<?php

namespace App\Filament\Resources\Categories\Schemas;

use App\Filament\Support\IconUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Set;
use Illuminate\Support\Str;

class CategoryForm
{
    public static function getSchema(): array
    {
        return [
            TextInput::make('name.ar')->label('Name (Arabic)')->required()->maxLength(255),
            TextInput::make('name.en')
                ->label('Name (English)')
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state ?? ''))),
            Select::make('type')
                ->label('Type')
                ->options([
                    'standard'      => 'Standard — has subcategories',
                    'disease_direct' => 'Disease Direct — diseases attach directly (no subcategories)',
                    'direct'        => 'Direct — recordings attach directly (no diseases or subcategories)',
                ])
                ->default('standard')
                ->required()
                ->helperText('Cannot be changed once the category has children of another type.'),
            ...IconUpload::make('categories', 'Best result: upload an SVG (stays crisp at any size). PNG/JPG/WebP are allowed but may look blurry on the category card.'),
            TextInput::make('display_order')->numeric()->default(0),
            Toggle::make('is_active')->default(true),
        ];
    }
}
