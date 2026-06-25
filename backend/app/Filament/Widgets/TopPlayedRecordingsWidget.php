<?php

namespace App\Filament\Widgets;

use App\Models\Recording;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Str;

class TopPlayedRecordingsWidget extends ChartWidget
{
    protected static ?int $sort = 10;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected string $color = 'warning';

    protected ?string $heading = 'Top Played Recordings';

    protected ?string $description = 'Most played hospital recordings (all time)';

    protected ?string $maxHeight = '300px';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $recordings = Recording::with('disease')
            ->orderByDesc('plays_count')
            ->limit(8)
            ->get();

        $labels = $recordings->map(function ($recording) {
            $context = $recording->disease
                ? Str::limit($recording->disease->getTranslation('name', 'en'), 12)
                : 'General';

            return $context . ' · S' . $recording->session_number;
        })->toArray();

        $counts = $recordings->pluck('plays_count')->toArray();

        $palette = [
            'rgba(245,158,11,.8)',
            'rgba(234,179,8,.8)',
            'rgba(249,115,22,.8)',
            'rgba(239,68,68,.75)',
            'rgba(245,158,11,.6)',
            'rgba(234,179,8,.6)',
            'rgba(249,115,22,.6)',
            'rgba(239,68,68,.55)',
        ];

        return [
            'datasets' => [
                [
                    'label'           => 'Plays',
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
