<?php

namespace App\Filament\Resources\Courses\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;

class CoursesTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('title')->label('Title')->searchable(),
            TextColumn::make('instructor_name')->label('Instructor'),
            TextColumn::make('price')->money('USD'),
            IconColumn::make('is_coming_soon')->label('Coming Soon')->boolean(),
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
