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
            ->columns(RecordingsTable::getColumns())
            ->filters(RecordingsTable::getFilters())
            ->actions(RecordingsTable::getActions())
            ->bulkActions(RecordingsTable::getBulkActions())
            ->defaultSort('session_number');
    }

    public static function getPages(): array
    {
        return ['index' => ManageRecordings::route('/')];
    }
}
