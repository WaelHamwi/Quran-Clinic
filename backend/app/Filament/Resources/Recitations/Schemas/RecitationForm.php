<?php

namespace App\Filament\Resources\Recitations\Schemas;

use App\Models\Reciter;
use App\Models\Surah;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Section;

class RecitationForm
{
    public static function getSchema(): array
    {
        return [
            Select::make('reciter_id')
                ->label('Reciter')
                ->options(fn() => Reciter::active()->orderBy('id')->get()->pluck('name', 'id')->toArray())
                ->searchable()
                ->preload()
                ->required(),
            Select::make('surah_id')
                ->label('Surah')
                ->options(fn() => Surah::orderBy('id')->get()
                    ->mapWithKeys(fn($s) => [$s->id => "{$s->id}. {$s->getTranslation('name', 'en')} — {$s->getTranslation('name', 'ar')}"])
                    ->toArray())
                ->searchable()
                ->preload()
                ->required(),
            TextInput::make('duration_seconds')
                ->label('Duration (seconds)')
                ->numeric()
                ->minValue(0),
            Section::make('Audio Source')
                ->description('Enter an external URL (for CDN audio) OR upload a local file. If you upload a file, it replaces the URL.')
                ->schema([
                    TextInput::make('audio_path')
                        ->label('External Audio URL')
                        ->placeholder('https://download.quranicaudio.com/...')
                        ->helperText('Seeded recitations use an external CDN URL. Leave as-is or replace with an uploaded file below.')
                        ->maxLength(2048)
                        ->dehydrated(fn($state) => $state !== null)
                        ->columnSpanFull(),
                    FileUpload::make('audio_file_upload')
                        ->label('Upload New Audio File (replaces URL above)')
                        ->disk('public')
                        ->directory('audio')
                        ->acceptedFileTypes(['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav'])
                        ->maxSize(102400)
                        ->columnSpanFull(),
                ]),
        ];
    }
}
