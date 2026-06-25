<?php

namespace App\Filament\Resources\TahsinatItems\Tables;

use App\Filament\Resources\TahsinatItems\TahsinatItemResource;
use App\Models\TahsinatCategory;
use App\Models\TahsinatSection;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;

class TahsinatItemsTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('label')->label('Label')->searchable(),
            TextColumn::make('category.name')->label('Category'),
            TextColumn::make('section.name')->label('Section'),
            TextColumn::make('applicability')->label('For')->badge(),
            TextColumn::make('repetitions')->label('Reps'),
            TextColumn::make('display_order')->label('Order')->sortable(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('tahsinat_category_id')
                ->label('Category')
                ->options(fn () => TahsinatCategory::ordered()->get()->pluck('name', 'id')),
            SelectFilter::make('tahsinat_section_id')
                ->label('Section')
                ->options(fn () => TahsinatSection::ordered()->get()->pluck('name', 'id')),
            SelectFilter::make('applicability')->options(TahsinatItemResource::APPLICABILITY),
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
