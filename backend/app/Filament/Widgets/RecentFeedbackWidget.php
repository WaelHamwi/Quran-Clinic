<?php

namespace App\Filament\Widgets;

use App\Models\Feedback;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentFeedbackWidget extends BaseWidget
{
    protected static ?int $sort = 8;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected static ?string $heading = 'Recent Feedback';

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Feedback::query()
                    ->with('user')
                    ->latest()
                    ->limit(8)
            )
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->default('Guest')
                    ->searchable(),

                Tables\Columns\TextColumn::make('service_type')
                    ->label('Service')
                    ->badge()
                    ->color('primary'),

                Tables\Columns\IconColumn::make('was_beneficial')
                    ->label('Beneficial')
                    ->boolean()
                    ->trueIcon('heroicon-o-hand-thumb-up')
                    ->falseIcon('heroicon-o-hand-thumb-down')
                    ->trueColor('success')
                    ->falseColor('danger'),

                Tables\Columns\TextColumn::make('likes')
                    ->label('Likes')
                    ->limit(40)
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('dislikes')
                    ->label('Dislikes')
                    ->limit(40)
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('comment')
                    ->label('Comment')
                    ->limit(60)
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime()
                    ->sortable(),
            ])
            ->paginated(false);
    }
}
