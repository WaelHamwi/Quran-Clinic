<?php

namespace App\Filament\Resources\Favorites\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Tables\Columns\TextColumn;

class FavoritesTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('user.name')->label('User')->searchable(),
            TextColumn::make('user.email')->label('Email')->searchable(),
            TextColumn::make('disease.name')->label('Disease'),
            TextColumn::make('created_at')->dateTime('d M Y')->sortable(),
        ];
    }

    public static function getFilters(): array
    {
        return [];
    }

    public static function getActions(): array
    {
        return [
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
