<?php

namespace App\Filament\Resources\Recordings;

use App\Filament\Resources\Recordings\Pages\ManageRecordings;
use App\Filament\Resources\Recordings\Schemas\RecordingForm;
use App\Filament\Resources\Recordings\Tables\RecordingsTable;
use App\Models\Recording;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class RecordingResource extends Resource
{
    protected static ?string $model = Recording::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-musical-note';

    protected static string|UnitEnum|null $navigationGroup = 'Hospital';

    protected static ?int $navigationSort = 5;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(RecordingForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => RecordingsTable::modifyQuery($query))
            ->columns(RecordingsTable::getColumns())
            ->filters(RecordingsTable::getFilters())
            ->actions(RecordingsTable::getActions())
            ->bulkActions(RecordingsTable::getBulkActions())
            ->headerActions(RecordingsTable::getHeaderActions())
            // Drag handles write straight into display_order, and are offered
            // only while the list is being read in that same custom order — so
            // the rows you drag are the rows you were already looking at, and
            // where you drop one is where it stays. Every other order is a way
            // of reading the library, not of rewriting it.
            //
            // The default sort deliberately stays on created_at: which order
            // the list opens in is the admin's choice, not ours — see the
            // "Order by" chooser beside the filters.
            ->reorderable('display_order', fn ($livewire): bool => RecordingsTable::isArrangingManually($livewire))
            ->defaultSort('created_at', 'desc')
            // Reordering normally drops pagination so every row is draggable at
            // once; with hundreds of recordings that is a single enormous page.
            // Pagination stays, and the numeric "Display order" field on the
            // form is the way to move something a long distance.
            ->paginatedWhileReordering();
    }

    public static function getPages(): array
    {
        return ['index' => ManageRecordings::route('/')];
    }
}
