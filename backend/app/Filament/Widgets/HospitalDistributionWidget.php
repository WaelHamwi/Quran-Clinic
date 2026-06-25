<?php

namespace App\Filament\Widgets;

use App\Models\Category;
use App\Models\Disease;
use Filament\Widgets\ChartWidget;

class HospitalDistributionWidget extends ChartWidget
{
    protected static ?int $sort = 6;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected string $color = 'danger';

    protected ?string $heading = 'Diseases per Category';

    protected ?string $description = 'Hospital disease distribution across categories';

    protected ?string $maxHeight = '300px';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $categories = Category::ordered()->get();

        $labels = [];
        $data   = [];

        foreach ($categories as $category) {
            $labels[] = $category->getTranslation('name', 'en');
            $data[]   = Disease::whereHas(
                'subcategory',
                fn ($q) => $q->where('category_id', $category->id)
            )->count();
        }

        $palette = [
            'rgba(239,68,68,.75)',
            'rgba(249,115,22,.75)',
            'rgba(234,179,8,.75)',
            'rgba(34,197,94,.75)',
            'rgba(14,165,233,.75)',
            'rgba(99,102,241,.75)',
            'rgba(168,85,247,.75)',
            'rgba(236,72,153,.75)',
        ];

        $colors = array_map(
            fn ($i) => $palette[$i % count($palette)],
            array_keys($data)
        );

        return [
            'datasets' => [
                [
                    'label'           => 'Diseases',
                    'data'            => $data,
                    'backgroundColor' => $colors,
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
