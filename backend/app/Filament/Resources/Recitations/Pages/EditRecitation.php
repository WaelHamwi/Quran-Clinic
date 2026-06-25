<?php

namespace App\Filament\Resources\Recitations\Pages;

use App\Filament\Resources\Recitations\RecitationResource;
use App\Jobs\CompressAudioJob;
use App\Models\Recitation;
use Filament\Resources\Pages\EditRecord;

class EditRecitation extends EditRecord
{
    protected static string $resource = RecitationResource::class;

    private bool $audioWasUploaded = false;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (! empty($data['audio_file_upload'])) {
            $data['audio_path']      = $data['audio_file_upload'];
            $this->audioWasUploaded  = true;
        }
        unset($data['audio_file_upload']);

        return $data;
    }

    protected function afterSave(): void
    {
        if (! $this->audioWasUploaded) {
            return;
        }

        $path = $this->record->audio_path;

        if ($path && ! str_starts_with($path, 'http')) {
            CompressAudioJob::dispatch(Recitation::class, $this->record->id, $path);
        }
    }
}
