<?php

namespace App\Filament\Resources\AdhkarSections;

use App\Filament\Resources\AdhkarSections\Pages\ManageAdhkarSections;
use App\Filament\Resources\AdhkarSections\Schemas\AdhkarSectionForm;
use App\Filament\Resources\AdhkarSections\Tables\AdhkarSectionsTable;
use App\Models\AdhkarSection;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class AdhkarSectionResource extends Resource
{
    protected static ?string $model = AdhkarSection::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-bars-3-bottom-left';

    protected static string|UnitEnum|null $navigationGroup = 'Adhkar';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema->components(AdhkarSectionForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(AdhkarSectionsTable::getColumns())
            ->filters(AdhkarSectionsTable::getFilters())
            ->actions(AdhkarSectionsTable::getActions())
            ->bulkActions(AdhkarSectionsTable::getBulkActions())
            ->defaultSort('display_order');
    }

    public static function getPages(): array
    {
        return ['index' => ManageAdhkarSections::route('/')];
    }
}
