<?php

namespace App\Filament\Resources\Users;

use App\Filament\Resources\Users\Pages;
use App\Filament\Resources\Users\RelationManagers;
use App\Filament\Resources\Users\Schemas\UserForm;
use App\Filament\Resources\Users\Tables\UsersTable;
use App\Models\User;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-users';

    protected static string|UnitEnum|null $navigationGroup = 'System';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema->components(UserForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(UsersTable::getColumns())
            ->filters(UsersTable::getFilters())
            ->actions(UsersTable::getActions())
            ->bulkActions(UsersTable::getBulkActions())
            ->defaultSort('created_at', 'desc');
    }

    // Per-user activity surfaced on the user's edit page: what they saved,
    // their reminder preferences, and the reports/suggestions they sent.
    public static function getRelations(): array
    {
        return [
            RelationManagers\FavoritesRelationManager::class,
            RelationManagers\NotificationPreferenceRelationManager::class,
            RelationManagers\ReportsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
