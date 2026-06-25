<?php

namespace App\Filament\Resources\DiseaseAliases\Tables;

use App\Models\Disease;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;

class DiseaseAliasesTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('alias')->label('Alias')->searchable(),
            TextColumn::make('disease.name')->label('Disease'),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('disease_id')
                ->label('Disease')
                ->options(fn () => Disease::ordered()->get()->pluck('name', 'id')),
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
            BulkActionGroup::make([DeleteBulkAction::make()]),
        ];
    }
}
