<?php

namespace App\Filament\Resources\Recordings\Pages;

use App\Filament\Resources\Recordings\RecordingResource;
use App\Jobs\CompressAudioJob;
use App\Models\Recording;
use Filament\Actions\CreateAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ManageRecords;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class ManageRecordings extends ManageRecords
{
    protected static string $resource = RecordingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->after(function (Recording $record): void {
                    if ($record->audio_path && ! str_starts_with($record->audio_path, 'http')) {
                        CompressAudioJob::dispatch(Recording::class, $record->id, $record->audio_path);
                    }
                }),
        ];
    }

    protected function handleRecordCreation(array $data): Model
    {
        try {
            return parent::handleRecordCreation($data);
        } catch (\LogicException $e) {
            Notification::make()->title($e->getMessage())->danger()->send();
            throw ValidationException::withMessages(['_' => $e->getMessage()]);
        }
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        try {
            return parent::handleRecordUpdate($record, $data);
        } catch (\LogicException $e) {
            Notification::make()->title($e->getMessage())->danger()->send();
            throw ValidationException::withMessages(['_' => $e->getMessage()]);
        }
    }
}
