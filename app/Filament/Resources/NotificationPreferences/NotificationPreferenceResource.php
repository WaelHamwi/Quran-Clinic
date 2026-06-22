<?php

namespace App\Filament\Resources\NotificationPreferences;

use App\Filament\Resources\NotificationPreferences\Pages\ManageNotificationPreferences;
use App\Filament\Resources\NotificationPreferences\Schemas\NotificationPreferenceForm;
use App\Filament\Resources\NotificationPreferences\Tables\NotificationPreferencesTable;
use App\Models\NotificationPreference;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class NotificationPreferenceResource extends Resource
{
    protected static ?string $model = NotificationPreference::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-bell';

    protected static string|UnitEnum|null $navigationGroup = 'Engagement';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Notification Preferences';

    protected static ?string $modelLabel = 'Notification Preference';

    // Read-only: preferences are owned and edited by the user from the app.
    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components(NotificationPreferenceForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(NotificationPreferencesTable::getColumns())
            ->filters(NotificationPreferencesTable::getFilters())
            ->actions(NotificationPreferencesTable::getActions())
            ->defaultSort('updated_at', 'desc');
    }

    public static function getPages(): array
    {
        return ['index' => ManageNotificationPreferences::route('/')];
    }
}
