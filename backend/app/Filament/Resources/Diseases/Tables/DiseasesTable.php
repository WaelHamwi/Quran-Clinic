<?php

namespace App\Filament\Resources\Diseases\Tables;

use App\Filament\Support\RecordingLinkActions;
use App\Filament\Support\TranslatedName;
use App\Models\Disease;
use App\Models\Subcategory;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;

class DiseasesTable
{
    public static function getColumns(): array
    {
        return [
            ImageColumn::make('icon')->label('Icon')->disk('public'),
            // Searching hits the `name` JSON column, so a query in either
            // language matches whichever of the two columns shows it.
            TextColumn::make('name')
                ->label('Name (Arabic)')
                ->getStateUsing(fn (Disease $record): ?string => TranslatedName::arabic($record))
                ->searchable()
                ->placeholder('— not set —'),
            TextColumn::make('name_en')
                ->label('Name (English)')
                ->getStateUsing(fn (Disease $record): ?string => TranslatedName::english($record))
                ->placeholder('— not set —'),
            TextColumn::make('subcategory.name')
                ->label('Subcategory')
                ->getStateUsing(fn (Disease $record): ?string => TranslatedName::arabic($record->subcategory))
                ->description(fn (Disease $record): ?string => TranslatedName::english($record->subcategory)),
            TextColumn::make('slug')->searchable(),
            TextColumn::make('recordings_count')->counts('recordings')->label('Recordings'),
            TextColumn::make('display_order')->sortable(),
            IconColumn::make('is_active')->boolean(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('subcategory_id')
                ->label('Subcategory')
                ->options(fn () => TranslatedName::options(Subcategory::ordered()->get())),
            SelectFilter::make('is_active')->options(['1' => 'Active', '0' => 'Inactive']),
        ];
    }

    public static function getActions(): array
    {
        return [
            RecordingLinkActions::edit(),
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
