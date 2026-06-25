<?php

namespace App\Filament\Resources\Recitations;

use App\Filament\Resources\Recitations\Pages;
use App\Filament\Resources\Recitations\Schemas\RecitationForm;
use App\Filament\Resources\Recitations\Tables\RecitationsTable;
use App\Models\Recitation;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class RecitationResource extends Resource
{
    protected static ?string $model = Recitation::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-musical-note';

    protected static string|UnitEnum|null $navigationGroup = 'Audio';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(RecitationForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(RecitationsTable::getColumns())
            ->filters(RecitationsTable::getFilters())
            ->actions(RecitationsTable::getActions())
            ->bulkActions(RecitationsTable::getBulkActions());
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListRecitations::route('/'),
            'create' => Pages\CreateRecitation::route('/create'),
            'edit'   => Pages\EditRecitation::route('/{record}/edit'),
        ];
    }
}
