<?php

namespace App\Filament\Widgets;

use App\Models\AdhkarItem;
use Filament\Widgets\ChartWidget;

class AdhkarTimingWidget extends ChartWidget
{
    protected static ?int $sort = 7;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected string $color = 'warning';

    protected ?string $heading = 'Adhkar by Timing';

    protected ?string $description = 'Distribution of adhkar items by prayer timing';

    protected ?string $maxHeight = '280px';

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getData(): array
    {
        // Timing now lives on the category, so count items grouped by category slug.
        $counts = AdhkarItem::query()
            ->join('adhkar_categories', 'adhkar_items.adhkar_category_id', '=', 'adhkar_categories.id')
            ->selectRaw('adhkar_categories.slug as slug, count(*) as total')
            ->groupBy('adhkar_categories.slug')
            ->pluck('total', 'slug');

        $morning = (int) ($counts['morning'] ?? 0);
        $evening = (int) ($counts['evening'] ?? 0);
        $sleep   = (int) ($counts['sleep'] ?? 0);
        $waking  = (int) ($counts['waking'] ?? 0);

        return [
            'datasets' => [
                [
                    'data'            => [$morning, $evening, $sleep, $waking],
                    'backgroundColor' => [
                        'rgba(249,115,22,.8)',
                        'rgba(99,102,241,.8)',
                        'rgba(30,58,138,.8)',
                        'rgba(234,179,8,.8)',
                    ],
                    'borderColor' => ['#f97316', '#6366f1', '#1e3a8a', '#eab308'],
                    'borderWidth' => 2,
                    'hoverOffset' => 8,
                ],
            ],
            'labels' => ['Morning', 'Evening', 'Sleep', 'Waking'],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                    'labels'   => ['padding' => 20, 'usePointStyle' => true],
                ],
            ],
            'cutout' => '68%',
        ];
    }
}
