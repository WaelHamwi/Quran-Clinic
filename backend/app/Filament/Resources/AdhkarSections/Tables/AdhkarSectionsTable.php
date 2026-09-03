<?php

namespace App\Filament\Resources\AdhkarSections\Tables;

use App\Models\AdhkarCategory;
use App\Models\AdhkarSection;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Livewire\Component;

class AdhkarSectionsTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->searchable(),
            TextColumn::make('category.name')->label('Category'),
            ToggleColumn::make('order_randomly')
                ->label('Order Randomly')
                ->tooltip('When on, this section\'s items are shuffled into a fresh random order every time it is viewed.'),
            TextColumn::make('display_order')->sortable(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('adhkar_category_id')
                ->label('Category')
                ->options(fn () => AdhkarCategory::ordered()->get()->pluck('name', 'id')),
            SelectFilter::make('id')
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
