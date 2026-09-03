<?php

namespace App\Filament\Resources\FeatureFlags;

use App\Filament\Resources\FeatureFlags\Pages\ManageFeatureFlags;
use App\Filament\Resources\FeatureFlags\Schemas\FeatureFlagForm;
use App\Filament\Resources\FeatureFlags\Tables\FeatureFlagsTable;
use App\Models\FeatureFlag;
use BackedEnum;
use Filament\Resources\Resource;
use Illuminate\Database\Eloquent\Model;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class FeatureFlagResource extends Resource
{
    protected static ?string $model = FeatureFlag::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-flag';

    protected static string|UnitEnum|null $navigationGroup = 'Engagement';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(FeatureFlagForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(FeatureFlagsTable::getColumns())
            ->filters(FeatureFlagsTable::getFilters())
            ->actions(FeatureFlagsTable::getActions())
            ->bulkActions(FeatureFlagsTable::getBulkActions());
    }

    public static function getPages(): array
    {
        return ['index' => ManageFeatureFlags::route('/')];
    }

    // Flags are seeded, not authored. Guarding here (not just hiding the buttons)
    // blocks creation/deletion through any other path as well.
    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }
}
