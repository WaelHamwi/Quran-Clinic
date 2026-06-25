<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Spatie\Permission\Models\Role;

class UsersTable
{
    public static function getColumns(): array
    {
        return [
            ImageColumn::make('avatar_path')
                ->label('')
                ->disk('public')
                ->circular()
                ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name) . '&background=10b981&color=fff&size=64')
                ->imageSize(40),

            TextColumn::make('name')
                ->label('Name')
                ->searchable()
                ->sortable()
                ->weight('medium'),

            TextColumn::make('email')
                ->label('Email')
                ->searchable()
                ->sortable()
                ->copyable()
                ->icon('heroicon-m-envelope'),

            TextColumn::make('roles.name')
                ->label('Role')
                ->badge()
                ->color(fn (string $state): string => match ($state) {
                    'super_admin' => 'danger',
                    'admin'       => 'warning',
                    default       => 'gray',
                })
                ->formatStateUsing(fn (string $state): string => match ($state) {
                    'super_admin' => 'Super Admin',
                    'admin'       => 'Admin',
                    default       => 'User',
                }),

            TextColumn::make('email_verified_at')
                ->label('Verified')
                ->dateTime('d M Y')
                ->sortable()
                ->placeholder('Not verified')
                ->icon('heroicon-m-check-badge')
                ->color('success'),

            TextColumn::make('created_at')
                ->label('Joined')
                ->date('d M Y')
                ->sortable()
                ->toggleable(isToggledHiddenByDefault: true),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('roles')
                ->relationship('roles', 'name')
                ->options(fn () => Role::pluck('name', 'id')->map(fn ($name) => match ($name) {
                    'super_admin' => 'Super Admin',
                    'admin'       => 'Admin',
                    default       => 'User',
                }))
                ->label('Role'),
        ];
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
            BulkActionGroup::make([
                DeleteBulkAction::make(),
            ]),
        ];
    }
}
