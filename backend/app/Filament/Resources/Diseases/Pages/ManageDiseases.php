<?php

namespace App\Filament\Resources\Diseases\Pages;

use App\Filament\Resources\Diseases\DiseaseResource;
use Filament\Actions\CreateAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ManageRecords;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class ManageDiseases extends ManageRecords
{
    protected static string $resource = DiseaseResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
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
