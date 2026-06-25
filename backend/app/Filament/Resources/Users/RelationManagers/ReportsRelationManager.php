<?php

namespace App\Filament\Resources\Users\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ReportsRelationManager extends RelationManager
{
    protected static string $relationship = 'reports';

    protected static ?string $title = 'Reports & suggestions';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('type')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => $state === 'bug' ? 'Technical bug' : 'Suggestion')
                    ->color(fn (string $state) => $state === 'bug' ? 'danger' : 'info'),
                TextColumn::make('message')->limit(60)->wrap(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'new'         => 'warning',
                        'in_progress' => 'info',
                        'resolved'    => 'success',
                        default       => 'gray',
                    }),
                TextColumn::make('created_at')->dateTime('d M Y, H:i')->sortable(),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
