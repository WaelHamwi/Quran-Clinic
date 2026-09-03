<?php

namespace App\Filament\Resources\FeatureFlags\Pages;

use App\Filament\Resources\FeatureFlags\FeatureFlagResource;
use Filament\Resources\Pages\ManageRecords;

class ManageFeatureFlags extends ManageRecords
{
    protected static string $resource = FeatureFlagResource::class;

    /** No "New feature flag" button — the flag set is fixed by the seeder. */
    protected function getHeaderActions(): array
    {
        return [];
    }
}
