<?php

namespace App\Filament\Resources\TahsinatSections;

use App\Filament\Resources\TahsinatSections\Pages\ManageTahsinatSections;
use App\Filament\Resources\TahsinatSections\Schemas\TahsinatSectionForm;
use App\Filament\Resources\TahsinatSections\Tables\TahsinatSectionsTable;
use App\Models\TahsinatSection;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class TahsinatSectionResource extends Resource
{
    protected static ?string $model = TahsinatSection::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-bars-3-bottom-left';

    protected static string|UnitEnum|null $navigationGroup = 'Tahsinat';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(TahsinatSectionForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(TahsinatSectionsTable::getColumns())
            ->filters(TahsinatSectionsTable::getFilters())
            ->actions(TahsinatSectionsTable::getActions())
            ->bulkActions(TahsinatSectionsTable::getBulkActions())
            ->defaultSort('display_order');
    }

    public static function getPages(): array
    {
        return ['index' => ManageTahsinatSections::route('/')];
    }
}
