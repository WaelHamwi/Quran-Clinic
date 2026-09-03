<?php

namespace App\Filament\Widgets;

use App\Filament\Support\TranslatedName;
use App\Models\Disease;
use App\Models\FavoriteNode;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Str;

class MostFavoritedDiseasesWidget extends ChartWidget
{
    protected static ?int $sort = 13;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected string $color = 'success';

    protected ?string $heading = 'Most Favorited';

    protected ?string $description = 'Diseases and sections saved to favorites the most (all time)';

    protected ?string $maxHeight = '300px';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $diseaseFavorites = Disease::withCount('favoritedBy')
            ->orderByDesc('favorited_by_count')
            ->limit(8)
            ->get()
            ->map(fn (Disease $disease) => [
                'name'  => TranslatedName::display($disease) ?? "#{$disease->id}",
                'count' => (int) $disease->favorited_by_count,
            ]);

        // Users can also favorite whole category/subcategory nodes (favorite_nodes
        // table) — count those alongside individual diseases.
        $nodeFavorites = FavoriteNode::query()
            ->selectRaw('kind, node_id, COUNT(*) as favorites_count')
            ->groupBy('kind', 'node_id')
            ->orderByDesc('favorites_count')
            ->limit(8)
            ->get()
            ->map(fn (FavoriteNode $row) => [
                'name'  => TranslatedName::display($row->node()) ?? ucfirst($row->kind) . " #{$row->node_id}",
                'count' => (int) $row->favorites_count,
            ]);

        $top = $diseaseFavorites->concat($nodeFavorites)
            ->sortByDesc('count')
            ->take(8)
            ->values();

        $labels = $top->map(fn ($item) => Str::limit($item['name'], 16))->toArray();

        $counts = $top->pluck('count')->toArray();

        $palette = [
            'rgba(34,197,94,.8)',
            'rgba(16,185,129,.8)',
            'rgba(20,184,166,.75)',
            'rgba(6,182,212,.75)',
            'rgba(34,197,94,.6)',
            'rgba(16,185,129,.6)',
            'rgba(20,184,166,.55)',
            'rgba(6,182,212,.55)',
        ];

        return [
            'datasets' => [
                [
                    'label'           => 'Favorites',
                    'data'            => $counts,
                    'backgroundColor' => array_slice($palette, 0, count($counts)),
                    'borderRadius'    => 8,
                    'borderWidth'     => 0,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => ['legend' => ['display' => false]],
            'scales'  => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks'       => ['stepSize' => 1],
                    'grid'        => ['drawBorder' => false],
                ],
                'x' => ['grid' => ['display' => false]],
            ],
        ];
    }
}
