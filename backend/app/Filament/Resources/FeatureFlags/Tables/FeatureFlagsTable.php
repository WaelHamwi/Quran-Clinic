<?php

namespace App\Filament\Resources\FeatureFlags\Tables;

use App\Models\FeatureFlag;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;

class FeatureFlagsTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('feature_key')->label('Feature')->searchable(),
            ToggleColumn::make('is_visible')
                ->label('Visible')
                // A child feature is locked off while its parent (e.g. Clinic) is hidden.
                ->disabled(fn (FeatureFlag $record): bool => $record->isLockedByParent())
                ->tooltip(fn (FeatureFlag $record): ?string => $record->isLockedByParent()
                    ? 'Disabled because its parent feature (' . $record->parentKey() . ') is hidden.'
                    : null),
        ];
    }

    public static function getFilters(): array
    {
        return [];
    }

    /**
     * Feature flags are a fixed, seeded set — the only supported interaction is
     * flipping the Visible toggle. Create/edit/delete are intentionally absent so
     * a flag can never be removed by accident (which silently breaks the mobile app).
     */
    public static function getActions(): array
    {
        return [];
    }

    public static function getBulkActions(): array
    {
        return [];
    }
}
