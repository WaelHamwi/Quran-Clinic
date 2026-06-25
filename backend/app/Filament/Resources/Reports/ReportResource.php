<?php

namespace App\Filament\Resources\Reports;

use App\Filament\Resources\Reports\Pages\ManageReports;
use App\Filament\Resources\Reports\Schemas\ReportForm;
use App\Filament\Resources\Reports\Tables\ReportsTable;
use App\Models\Report;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class ReportResource extends Resource
{
    protected static ?string $model = Report::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-flag';

    protected static string|UnitEnum|null $navigationGroup = 'Engagement';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Reports & Suggestions';

    protected static ?string $modelLabel = 'Report';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) Report::where('status', 'new')->count() ?: null;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components(ReportForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(ReportsTable::getColumns())
            ->filters(ReportsTable::getFilters())
            ->actions(ReportsTable::getActions())
            ->bulkActions(ReportsTable::getBulkActions())
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return ['index' => ManageReports::route('/')];
    }
}
