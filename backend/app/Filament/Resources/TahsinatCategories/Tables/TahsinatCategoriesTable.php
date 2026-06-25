<?php

namespace App\Filament\Resources\TahsinatCategories\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;

class TahsinatCategoriesTable
{
    public static function getColumns(): array
    {
        return [
            ImageColumn::make('icon')->label('Icon')->disk('public'),
            TextColumn::make('name')->label('Name')->searchable(),
            TextColumn::make('slug')->searchable(),
            TextColumn::make('items_count')->counts('items')->label('Items'),
            IconColumn::make('is_active')->boolean(),
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
