<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Widgets\ChartWidget;

class UserDemographicsWidget extends ChartWidget
{
    protected static ?int $sort = 12;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected ?string $heading = 'User Demographics';

    protected ?string $description = 'Registered users by gender';

    protected ?string $maxHeight = '260px';

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getData(): array
    {
        $male       = User::where('gender', 'male')->count();
        $female     = User::where('gender', 'female')->count();
        $unspecified = User::whereNull('gender')->count();

        return [
            'datasets' => [
                [
                    'data'            => [$male, $female, $unspecified],
                    'backgroundColor' => ['#3b82f6', '#ec4899', '#94a3b8'],
                    'borderWidth'     => 0,
                ],
            ],
            'labels' => ['Male', 'Female', 'Unspecified'],
        ];
    }
}
