<?php

namespace App\Filament\Resources\Sponsors\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;

class SponsorsTable
{
    public static function getColumns(): array
    {
        return [
            ImageColumn::make('logo_path')->label('Logo')->disk('public'),
            TextColumn::make('name')->label('Name')->searchable(),
            TextColumn::make('website_url')->label('Website')->limit(30),
            IconColumn::make('target_all_countries')->label('All countries')->boolean(),
            TextColumn::make('target_countries')
                ->label('Countries')
                ->badge()
                ->placeholder('All')
                ->limitList(2),
            IconColumn::make('is_featured')->label('Featured')->boolean(),
            IconColumn::make('display_on_launch')->label('On Launch')->boolean(),
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
