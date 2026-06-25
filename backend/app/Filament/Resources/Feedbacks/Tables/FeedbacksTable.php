<?php

namespace App\Filament\Resources\Feedbacks\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;

class FeedbacksTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('user.name')->label('User')->searchable(),
            TextColumn::make('service_type')->label('Service')->badge(),
            TextColumn::make('service_id')->label('Service ID'),
            IconColumn::make('was_beneficial')->label('Beneficial')->boolean(),
            TextColumn::make('comment')->limit(60)->wrap(),
            TextColumn::make('created_at')->dateTime('d M Y')->sortable(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('was_beneficial')->options(['1' => 'Beneficial', '0' => 'Not beneficial']),
            SelectFilter::make('service_type')->options([
                'disease'   => 'Disease',
                'recording' => 'Recording',
                'adhkar'    => 'Adhkar',
                'tahsinat'  => 'Tahsinat',
            ]),
        ];
    }

    public static function getActions(): array
    {
        return [
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
