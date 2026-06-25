<?php

namespace App\Filament\Resources\Reciters\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

class ReciterForm
{
    public static function getSchema(): array
    {
        return [
            TextInput::make('name.ar')
                ->label('Arabic Name')
                ->required()
                ->maxLength(150),
            TextInput::make('name.en')
                ->label('English Name')
                ->required()
                ->maxLength(150),
            Textarea::make('bio.ar')
                ->label('Bio (Arabic)')
                ->rows(3)
                ->columnSpanFull(),
            Textarea::make('bio.en')
                ->label('Bio (English)')
                ->rows(3)
                ->columnSpanFull(),
            FileUpload::make('photo_path')
                ->label('Photo')
                ->disk('public')
                ->directory('reciters/photos')
                ->image()
                ->imageResizeMode('cover')
                ->imageCropAspectRatio('1:1')
                ->columnSpanFull(),
            Toggle::make('is_active')
                ->label('Active')
                ->default(true),
        ];
    }
}
