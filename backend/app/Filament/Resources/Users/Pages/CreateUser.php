<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Models\User;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    /**
     * Subscription/suspension columns are not mass assignable (overposting
     * guard on the public API), so the admin form must set them via
     * forceFill. Everything else keeps the default fillable behaviour.
     */
    protected function handleRecordCreation(array $data): Model
    {
        $record = new User;
        $record->forceFill(Arr::only($data, User::PRIVILEGED_FIELDS));
        $record->fill(Arr::except($data, User::PRIVILEGED_FIELDS));
        $record->save();

        return $record;
    }
}
