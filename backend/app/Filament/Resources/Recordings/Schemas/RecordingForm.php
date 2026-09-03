<?php

namespace App\Filament\Resources\Recordings\Schemas;

use App\Models\Recording;
use Closure;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Illuminate\Database\Eloquent\Model;

class RecordingForm
{
    public static function getSchema(): array
    {
        return [
            TextInput::make('code')
                ->label('Ruqyah Code')
                ->maxLength(50)
                ->helperText('The code this recording is filed under in the source sheet — enter it exactly as written there (any format). It is what this recording is listed by in the table and picked by on the Category / Subcategory / Disease forms. Leave it blank if the sheet has no code for it yet; nothing is invented to fill the gap.')
                ->dehydrateStateUsing(fn (?string $state): ?string => Recording::normalizeCode($state))
                // Ignores soft-deleted recordings, matching the rule the model
                // enforces — a deleted recording never holds a code hostage.
                ->rule(fn (?Model $record) => function (string $attribute, $value, Closure $fail) use ($record): void {
                    $code = Recording::normalizeCode(is_string($value) ? $value : null);

                    if ($code === null) {
                        return;
                    }

                    $taken = Recording::query()
                        ->where('code', $code)
                        ->when($record?->exists, fn ($q) => $q->whereKeyNot($record->getKey()))
                        ->exists();

                    if ($taken) {
                        $fail("Another recording already uses the code \"{$code}\".");
                    }
                }),
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
            FileUpload::make('audio_files')
                ->label('Recording File(s)')
                ->disk('local')
                ->directory('recordings')
                ->acceptedFileTypes(['audio/*', 'video/mp4'])
                ->maxSize(204800)
                ->multiple()
                ->reorderable()
                ->appendFiles()
                ->afterStateHydrated(function (FileUpload $component, ?Model $record): void {
                    if ($record?->audio_path && ! str_starts_with($record->audio_path, 'http')) {
                        $component->state([$record->audio_path]);
                    }
                })
                ->helperText('Upload one file to use it as-is, or several — they will be merged into a single recording in the order shown here (drag to reorder). Accepted: any audio format — mp3, m4a, aac, ogg, opus, wav, webm (max 200 MB each).'),
            TextInput::make('duration_seconds')->numeric()->minValue(0),
            Select::make('type')
                ->label('Recording Type')
                ->options([
                    Recording::TYPE_SUMMARIZED => 'Summarized (مختصرة) — Free',
                    Recording::TYPE_DETAILED   => 'Detailed (مطولة) — Paid',
                ])
                ->default(Recording::TYPE_SUMMARIZED)
                ->required()
                ->native(false)
                ->helperText('Summarized is free for everyone; detailed needs a subscription or trial. A Category / Subcategory / Disease can hold as many of each as its content needs — the app shows them as مختصرة / مطولة tabs, in the order set on that item.'),
            Toggle::make('is_general')
                ->label('General Ruqyah')
                ->helperText('Include this recording in the General Ruqyah playlist.'),
            TextInput::make('display_order')
                ->label('Display order')
                ->numeric()
                ->minValue(0)
                // No default: left blank, the model appends the recording to the
                // end of the library instead of parking it at 0 with every other
                // new row.
                ->placeholder('Added to the end')
                ->helperText('Where this recording sits in the Recordings list. Normally you set this by dragging rows in the table — type a number here when you need to move it further than the page you are on. It orders the list only; what plays, and in what order, is the sequence set on each Category / Subcategory / Disease.'),
        ];
    }
}
