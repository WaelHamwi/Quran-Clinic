<?php

namespace App\Filament\Resources\Categories\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Illuminate\Database\Eloquent\Model;

class CategoriesTable
{
    public static function getColumns(): array
    {
        return [
            ImageColumn::make('icon')->label('Icon')->disk('public'),
            TextColumn::make('name')->label('Name')->searchable(),
            TextColumn::make('slug')->searchable(),
            TextColumn::make('subcategories_count')->counts('subcategories')->label('Subcategories'),
            TextColumn::make('recordings_count')->counts('recordings')->label('Recordings'),
            TextColumn::make('display_order')->sortable(),
            IconColumn::make('is_active')->boolean(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('is_active')->options(['1' => 'Active', '0' => 'Inactive']),
        ];
    }

    public static function getActions(): array
    {
        return [
            EditAction::make()
                ->action(function (EditAction $action, Model $record, array $data): void {
                    try {
                        $record->fill($data);
                        $record->save();
                    } catch (\LogicException $e) {
                        Notification::make()
                            ->title($e->getMessage())
                            ->danger()
                            ->send();
                        $action->halt();
                    }
                }),
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
