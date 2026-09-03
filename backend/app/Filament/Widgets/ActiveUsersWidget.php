<?php

namespace App\Filament\Widgets;

use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ActiveUsersWidget extends BaseWidget
{
    protected static ?int $sort = 11;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        // Snapshot only: `last_active_at` holds the most recent activity moment per
        // user (updated at most once/hour by LogUserActivity), not a daily history,
        // so this reflects "active right now within the window" rather than a trend.
        $dau = User::where('last_active_at', '>=', now()->subDay())->count();
        $mau = User::where('last_active_at', '>=', now()->subDays(30))->count();

        return [
            Stat::make('Daily Active Users', number_format($dau))
                ->description('Active in the last 24 hours')
                ->descriptionIcon('heroicon-m-bolt', 'before')
                ->icon('heroicon-o-signal')
                ->color('success'),

            Stat::make('Monthly Active Users', number_format($mau))
                ->description('Active in the last 30 days')
                ->descriptionIcon('heroicon-m-calendar', 'before')
                ->icon('heroicon-o-signal')
                ->color('primary'),
        ];
    }
}
