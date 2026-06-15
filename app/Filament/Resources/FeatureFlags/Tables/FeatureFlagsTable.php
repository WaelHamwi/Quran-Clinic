<?php

namespace App\Filament\Resources\FeatureFlags\Tables;

use App\Models\FeatureFlag;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
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

    public static function getActions(): array
    {
        return [
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
