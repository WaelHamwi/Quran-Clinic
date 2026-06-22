<?php

namespace App\Filament\Resources\Users\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class FavoritesRelationManager extends RelationManager
{
    protected static string $relationship = 'favorites';

    protected static ?string $title = 'Favorites (saved diseases)';

    public function table(Table $table): Table
    {
        // Read-only: favorites are managed by the user in the app.
        return $table
            ->columns([
                TextColumn::make('name')->label('Disease')->searchable(),
                TextColumn::make('subcategory.name')->label('Subcategory')->placeholder('—'),
                TextColumn::make('pivot.created_at')->label('Saved on')->dateTime('d M Y, H:i'),
            ])
            ->paginated([10, 25, 50]);
    }
}
