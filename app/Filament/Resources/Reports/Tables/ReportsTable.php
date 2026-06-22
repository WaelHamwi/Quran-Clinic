<?php

namespace App\Filament\Resources\Reports\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Illuminate\Database\Eloquent\Builder;

class ReportsTable
{
    public static function getColumns(): array
    {
        return [
            TextColumn::make('submitted_by')
                ->label('User')
                // Signed-in account name, else the guest-typed name, else a marker.
                ->state(fn ($record) => $record->user?->name ?? $record->guest_name ?? 'Guest')
                ->description(fn ($record) => $record->user ? null : 'Guest')
                ->searchable(query: fn (Builder $query, string $search) => $query
                    ->whereHas('user', fn (Builder $q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhere('guest_name', 'like', "%{$search}%")),
            TextColumn::make('type')
                ->badge()
                ->formatStateUsing(fn (string $state) => match ($state) {
                    'bug'        => 'Technical bug',
                    'suggestion' => 'Suggestion',
                    default      => $state,
                })
                ->color(fn (string $state) => $state === 'bug' ? 'danger' : 'info'),
            TextColumn::make('message')->limit(60)->wrap(),
            ImageColumn::make('image_path')->label('Image')->disk('public')->square(),
            TextColumn::make('status')
                ->badge()
                ->color(fn (string $state) => match ($state) {
                    'new'         => 'warning',
                    'in_progress' => 'info',
                    'resolved'    => 'success',
                    default       => 'gray',
                }),
            TextColumn::make('created_at')->dateTime('d M Y, H:i')->sortable(),
        ];
    }

    public static function getFilters(): array
    {
        return [
            SelectFilter::make('type')->options([
                'bug'        => 'Technical bug',
                'suggestion' => 'Suggestion',
            ]),
            SelectFilter::make('status')->options([
                'new'         => 'New',
                'in_progress' => 'In progress',
                'resolved'    => 'Resolved',
            ]),
        ];
    }

    public static function getActions(): array
    {
        return [
            EditAction::make()->label('View / Triage'),
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
