<?php

namespace App\Filament\Resources\Recitations\Tables;

use App\Models\Reciter;
use App\Models\Surah;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\Action;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;

class RecitationsTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('reciter.name')
                ->label('Reciter')
                ->sortable(),
            TextColumn::make('surah.id')
                ->label('#')
                ->sortable(),
            TextColumn::make('surah.name')
                ->label('Surah'),
            TextColumn::make('surah_name_ar')
                ->label('Arabic')
                ->getStateUsing(fn ($record) => $record->surah?->getTranslation('name', 'ar'))
                ->alignEnd(),
            TextColumn::make('duration_seconds')
                ->label('Duration (s)')
                ->sortable()
                ->placeholder('—'),
            IconColumn::make('is_external')
                ->label('Source')
                ->getStateUsing(fn($record) => str_starts_with((string) $record->audio_path, 'http'))
                ->icon(fn(bool $state) => $state ? 'heroicon-o-cloud' : 'heroicon-o-folder')
                ->color(fn(bool $state) => $state ? 'info' : 'success')
                ->tooltip(fn(bool $state) => $state ? 'External URL' : 'Uploaded file'),
            TextColumn::make('created_at')
                ->dateTime('d M Y')
                ->sortable()
                ->toggleable(isToggledHiddenByDefault: true),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('reciter_id')
                ->label('Reciter')
                ->options(fn() => Reciter::orderBy('id')->get()->pluck('name', 'id')->toArray())
                ->searchable(),
            SelectFilter::make('surah_id')
                ->label('Surah')
                ->options(fn() => Surah::orderBy('id')->get()->pluck('name', 'id')->toArray())
                ->searchable(),
        ];
    }

    public static function getActions(): array
    {
        return [
            Action::make('listen')
                ->label('Listen')
                ->icon('heroicon-o-play-circle')
                ->color('success')
                ->modalContent(function ($record) {
                    $path = (string) $record->audio_path;
                    $audioUrl = (str_starts_with($path, 'http://') || str_starts_with($path, 'https://'))
                        ? $path
                        : asset('storage/' . $path);

                    return view('filament.recitations.audio-player-modal', [
                        'audioUrl'  => $audioUrl,
                        'surahName' => $record->surah->name,
                        'surahId'   => $record->surah_id,
                    ]);
                })
                ->modalHeading(fn($record) => "Listen to {$record->surah->name}")
                ->modalSubmitAction(false)
                ->modalCancelActionLabel('Close'),
            EditAction::make(),
            DeleteAction::make(),
        ];
    }

    public static function getBulkActions(): array
    {
        return [
            BulkActionGroup::make([DeleteBulkAction::make()]),
        ];
    }
}
