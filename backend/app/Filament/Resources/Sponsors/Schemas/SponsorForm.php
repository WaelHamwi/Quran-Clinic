<?php

namespace App\Filament\Resources\Sponsors\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Get;

class SponsorForm
{
    public static function getSchema(): array
    {
        return [
            TextInput::make('name.ar')->label('Name (Arabic)')->required()->maxLength(255),
            TextInput::make('name.en')->label('Name (English)')->required()->maxLength(255),
            FileUpload::make('logo_path')
                ->label('Logo')
                ->image()
                ->acceptedFileTypes(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
                ->maxSize(5120)
                ->disk('public')
                ->directory('sponsors')
                ->helperText('PNG, JPG, WEBP, GIF or SVG (max 5 MB).'),
            TextInput::make('website_url')->url()->maxLength(255),
            Toggle::make('target_all_countries')
                ->label('Show to all countries')
                ->helperText('On = the sponsor screen shows to every user regardless of country.')
                ->default(true)
                ->live(),
            Select::make('target_countries')
                ->label('Target countries')
                ->multiple()
                ->searchable()
                ->native(false)
                // Show every country (default cap is 50) so the user can scroll
                // the whole list / keep loading more as they scroll.
                ->optionsLimit(fn () => \count((array) config('countries')))
                ->options(fn () => array_combine(config('countries'), config('countries')))
                ->helperText('Only users from these countries will see this sponsor.')
                ->visible(fn (Get $get) => ! $get('target_all_countries'))
                ->required(fn (Get $get) => ! $get('target_all_countries')),
            Select::make('target_genders')
                ->multiple()
                ->options(['male' => 'Male', 'female' => 'Female'])
                ->helperText('Leave empty for all.'),
            Toggle::make('is_featured'),
            Toggle::make('display_on_launch')->label('Show on splash screen'),
            TextInput::make('display_order')->numeric()->default(0),
            Toggle::make('is_active')->default(true),
        ];
    }
}
