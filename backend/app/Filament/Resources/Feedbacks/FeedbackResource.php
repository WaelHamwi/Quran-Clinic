<?php

namespace App\Filament\Resources\Feedbacks;

use App\Filament\Resources\Feedbacks\Pages\ManageFeedback;
use App\Filament\Resources\Feedbacks\Schemas\FeedbackForm;
use App\Filament\Resources\Feedbacks\Tables\FeedbacksTable;
use App\Models\Feedback;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use UnitEnum;

class FeedbackResource extends Resource
{
    protected static ?string $model = Feedback::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-chat-bubble-bottom-center-text';

    protected static string|UnitEnum|null $navigationGroup = 'Engagement';

    protected static ?int $navigationSort = 1;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components(FeedbackForm::getSchema());
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns(FeedbacksTable::getColumns())
            ->filters(FeedbacksTable::getFilters())
            ->actions(FeedbacksTable::getActions())
            ->bulkActions(FeedbacksTable::getBulkActions())
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return ['index' => ManageFeedback::route('/')];
    }
}
