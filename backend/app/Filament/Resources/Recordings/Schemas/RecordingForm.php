<?php

namespace App\Filament\Resources\Recordings\Schemas;

use App\Models\Category;
use App\Models\Disease;
use App\Models\Subcategory;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Get;

class RecordingForm
{
    public static function getSchema(): array
    {
        return [
            Select::make('disease_id')
                ->label('Disease')
                ->options(fn () => Disease::ordered()->get()->pluck('name', 'id'))
                ->searchable()
                ->nullable()
                ->live()
                ->disabled(fn (Get $get) => filled($get('category_id')) || filled($get('subcategory_id')))
                ->helperText('Attach to a Disease — OR pick a Subcategory/Category below instead.'),
            Select::make('subcategory_id')
                ->label('Subcategory (without diseases)')
                ->options(fn () => Subcategory::doesntHave('diseases')->ordered()->get()->pluck('name', 'id'))
                ->searchable()
                ->nullable()
                ->live()
                ->disabled(fn (Get $get) => filled($get('disease_id')) || filled($get('category_id')))
                ->helperText('Only subcategories that have no diseases can hold recordings directly.'),
            Select::make('category_id')
                ->label('Category (without subcategories)')
                ->options(fn () => Category::where('type', 'direct')->ordered()->get()->pluck('name', 'id'))
                ->searchable()
                ->nullable()
                ->live()
                ->disabled(fn (Get $get) => filled($get('disease_id')) || filled($get('subcategory_id')))
                ->helperText('Only direct-type categories can hold recordings directly.'),
            Textarea::make('description.ar')->label('Description (Arabic)')->rows(4),
            Textarea::make('description.en')->label('Description (English)')->rows(4),
            Repeater::make('segments')
                ->label('Timed Segments (Karaoke)')
                ->helperText('Each segment maps a time range (in seconds) to the Arabic / English text displayed during playback.')
                ->schema([
                    TextInput::make('start')
                        ->label('Start (s)')
                        ->numeric()
                        ->step(0.1)
                        ->minValue(0)
                        ->required(),
                    TextInput::make('end')
                        ->label('End (s)')
                        ->numeric()
                        ->step(0.1)
                        ->minValue(0)
                        ->required(),
                    Textarea::make('text_ar')
                        ->label('Arabic Text')
                        ->rows(2)
                        ->required(),
                    Textarea::make('text_en')
                        ->label('English Text')
                        ->rows(2),
                ])
                ->columns(2)
                ->defaultItems(0)
                ->reorderable()
                ->collapsible()
                ->itemLabel(fn (array $state): string => sprintf(
                    '%.1fs – %.1fs  %s',
                    (float) ($state['start'] ?? 0),
                    (float) ($state['end'] ?? 0),
                    mb_substr($state['text_ar'] ?? '', 0, 40),
                )),
            FileUpload::make('audio_path')
                ->label('Recording File')
                ->disk('public')
                ->directory('recordings')
                ->acceptedFileTypes(['audio/*', 'video/mp4'])
                ->maxSize(204800)
                ->helperText('Accepted: any audio format — mp3, m4a, aac, ogg, opus, wav, webm (max 200 MB).'),
            TextInput::make('duration_seconds')->numeric()->minValue(0),
            Toggle::make('is_free')
                ->label('Free Session')
                ->helperText('Mark this as the free session for its disease / category. Enabling it will automatically lock whichever session was free before.'),
            Toggle::make('is_general')
                ->label('General Ruqyah')
                ->helperText('Include this recording in the General Ruqyah playlist.'),
        ];
    }
}
