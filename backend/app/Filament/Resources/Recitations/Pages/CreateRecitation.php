<?php

namespace App\Filament\Resources\Recitations\Pages;

use App\Filament\Resources\Recitations\RecitationResource;
use App\Jobs\CompressAudioJob;
use App\Models\Recitation;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateRecitation extends CreateRecord
{
    protected static string $resource = RecitationResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        if (!empty($data['audio_file_upload'])) {
            $data['audio_path'] = $data['audio_file_upload'];
        }
        unset($data['audio_file_upload']);

        return $data;
    }

    protected function handleRecordCreation(array $data): Model
    {
        $existing = Recitation::withTrashed()
            ->where('reciter_id', $data['reciter_id'])
            ->where('surah_id', $data['surah_id'])
            ->first();

        if ($existing) {
            if ($existing->trashed()) {
                $existing->restore();
                $existing->update($data);
                return $existing->fresh();
            }

            Notification::make()
                ->title('Duplicate recitation')
                ->body('This reciter already has a recitation for this Surah. Edit the existing record instead.')
                ->danger()
                ->send();

            $this->halt();
        }

        return parent::handleRecordCreation($data);
    }

    protected function afterCreate(): void
    {
        $path = $this->record->audio_path;

        if ($path && ! str_starts_with($path, 'http')) {
            CompressAudioJob::dispatch(Recitation::class, $this->record->id, $path);
        }
    }
}
