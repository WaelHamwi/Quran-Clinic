<?php

namespace App\Filament\Resources\AdhkarItems\Tables;

use App\Models\AdhkarCategory;
use App\Models\AdhkarSection;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Livewire\Component;

class AdhkarItemsTable
{
    public static function getColumns(): array
    {
        return [
            ImageColumn::make('image')->label('Image')->disk('public')->square(),
            TextColumn::make('text')->label('Text')->limit(50)->searchable(),
            TextColumn::make('category.name')->label('Category'),
            TextColumn::make('section.name')->label('Section'),
            TextColumn::make('repetitions')->label('Reps'),
            TextColumn::make('display_order')->label('Order')->sortable(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('adhkar_category_id')
                ->label('Category')
                ->options(fn () => AdhkarCategory::ordered()->get()->pluck('name', 'id')),
            SelectFilter::make('adhkar_section_id')
                ->label('Section')
                ->searchable()
                ->options(fn (Component $livewire) => AdhkarSection::query()
                    ->when(
                        $livewire->getTableFilterFormState('adhkar_category_id')['value'] ?? null,
                        fn ($query, $categoryId) => $query->where('adhkar_category_id', $categoryId),
                    )
                    ->ordered()->get()->pluck('name', 'id')),
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
