<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Illuminate\Support\Facades\DB;
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

            IconColumn::make('is_subscribed')
                ->label('Subscribed')
                ->boolean()
                ->sortable(),

            IconColumn::make('is_suspended')
                ->label('Suspended')
                ->boolean()
                ->trueColor('danger')
                ->falseColor('gray')
                ->sortable(),

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

            SelectFilter::make('country')
                ->options(fn () => DB::table('users')
                    ->whereNotNull('country')
                    ->distinct()
                    ->orderBy('country')
                    ->pluck('country', 'country'))
                ->label('Country'),

            SelectFilter::make('gender')
                ->options(['male' => 'Male', 'female' => 'Female'])
                ->label('Gender'),

            TernaryFilter::make('is_subscribed')
                ->label('Subscription'),

            TernaryFilter::make('is_suspended')
                ->label('Suspended'),
        ];
    }

    public static function getActions(): array
    {
        return [
            EditAction::make(),

            Action::make('suspend')
                ->label('Suspend')
                ->icon('heroicon-o-no-symbol')
                ->color('danger')
                ->requiresConfirmation()
                ->visible(fn ($record) => ! $record->is_suspended)
                ->action(fn ($record) => $record->forceFill(['is_suspended' => true, 'suspended_at' => now()])->save()),

            Action::make('reactivate')
                ->label('Reactivate')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->requiresConfirmation()
                ->visible(fn ($record) => $record->is_suspended)
                ->action(fn ($record) => $record->forceFill(['is_suspended' => false, 'suspended_at' => null])->save()),

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
