<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class UserGrowthWidget extends ChartWidget
{
    protected static ?int $sort = 9;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected string $color = 'primary';

    protected ?string $heading = 'User Registrations';

    protected ?string $description = 'New user sign-ups over the last 12 months';

    protected ?string $maxHeight = '280px';

    protected int | string | array $columnSpan = 'full';

    protected function getType(): string
    {
        return 'line';
    }

    protected function getData(): array
    {
        $rows = DB::table('users')
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as total')
            ->whereNull('deleted_at')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupByRaw('YEAR(created_at), MONTH(created_at)')
            ->orderByRaw('YEAR(created_at), MONTH(created_at)')
            ->get();

        $labels = $rows->map(
            fn ($row) => date('M Y', mktime(0, 0, 0, $row->month, 1, $row->year))
        )->toArray();

        $counts = $rows->pluck('total')->toArray();

        return [
            'datasets' => [
                [
                    'label'                => 'New Users',
                    'data'                 => $counts,
                    'borderColor'          => '#6366f1',
                    'backgroundColor'      => 'rgba(99,102,241,.1)',
                    'fill'                 => true,
                    'tension'              => 0.4,
                    'pointBackgroundColor' => '#6366f1',
                    'pointRadius'          => 5,
                    'pointHoverRadius'     => 8,
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
                    'grid'        => ['color' => 'rgba(99,102,241,.08)'],
                ],
                'x' => ['grid' => ['display' => false]],
            ],
        ];
    }
}
