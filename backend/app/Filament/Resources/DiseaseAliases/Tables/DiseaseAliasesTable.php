<?php

namespace App\Filament\Resources\DiseaseAliases\Tables;

use App\Filament\Support\TranslatedName;
use App\Models\Disease;
use App\Models\DiseaseAlias;
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
            TextColumn::make('disease.name')
                ->label('Disease')
                ->getStateUsing(fn (DiseaseAlias $record): ?string => TranslatedName::arabic($record->disease))
                ->description(fn (DiseaseAlias $record): ?string => TranslatedName::english($record->disease)),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('disease_id')
                ->label('Disease')
                ->options(fn () => TranslatedName::options(Disease::ordered()->get())),
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
