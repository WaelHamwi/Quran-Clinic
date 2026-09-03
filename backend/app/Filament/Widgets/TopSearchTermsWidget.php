<?php

namespace App\Filament\Widgets;

use App\Models\SearchLog;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Support\Facades\DB;

class TopSearchTermsWidget extends BaseWidget
{
    protected static ?int $sort = 14;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected static ?string $heading = 'Top Search Terms';

    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        // Wrap the grouped query as a subquery aliased 'search_logs' so that
        // Filament's automatic stable sort (ORDER BY search_logs.id ASC) refers
        // to the already-aggregated MIN(id) column — avoiding MySQL only_full_group_by.
        $subquery = DB::table('search_logs')
            ->selectRaw('MIN(id) as id, term, COUNT(*) as searches, MAX(created_at) as last_searched_at')
            ->groupBy('term')
            ->orderByDesc('searches')
            ->limit(10);

        return $table
            ->query(
                SearchLog::fromSub($subquery, 'search_logs')->select('search_logs.*')
            )
            ->defaultSort('searches', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('term')
                    ->label('Term'),

                Tables\Columns\TextColumn::make('searches')
                    ->label('Searches')
                    ->badge()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('last_searched_at')
                    ->label('Last Searched')
                    ->dateTime(),
            ])
            ->paginated(false);
    }
}
