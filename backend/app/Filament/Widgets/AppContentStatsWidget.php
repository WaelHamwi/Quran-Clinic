<?php

namespace App\Filament\Widgets;

use App\Models\Disease;
use App\Models\Recording;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\DB;

class AppContentStatsWidget extends BaseWidget
{
    protected static ?int $sort = 4;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        $totalUsers      = User::count();
        $subscribedUsers = User::where('is_subscribed', true)->count();

        $totalDiseases  = Disease::count();
        $activeDiseases = Disease::active()->count();

        $totalRecordings   = Recording::count();
        $freeRecordings    = Recording::free()->count();
        $premiumRecordings = Recording::premium()->count();

        $totalFavorites = DB::table('favorites')->count();

        return [
            Stat::make('App Users', number_format($totalUsers))
                ->description("{$subscribedUsers} subscribed")
                ->descriptionIcon('heroicon-m-user-group', 'before')
                ->icon('heroicon-o-users')
                ->color('primary')
                ->chart([1, 2, 3, 5, 8, 13, 21, 34, 55, max($totalUsers, 1)]),

            Stat::make('Diseases', number_format($totalDiseases))
                ->description("{$activeDiseases} active")
                ->descriptionIcon('heroicon-m-heart', 'before')
                ->icon('heroicon-o-heart')
                ->color('danger')
                ->chart([1, 3, 6, 10, 15, 21, 28, 36, 45, max($totalDiseases, 1)]),

            Stat::make('Hospital Recordings', number_format($totalRecordings))
                ->description("{$freeRecordings} free · {$premiumRecordings} premium")
                ->descriptionIcon('heroicon-m-speaker-wave', 'before')
                ->icon('heroicon-o-speaker-wave')
                ->color('warning')
                ->chart([1, 3, 7, 12, 18, 25, 33, 42, 52, max($totalRecordings, 1)]),

            Stat::make('Favorites', number_format($totalFavorites))
                ->description('Diseases saved by users')
                ->descriptionIcon('heroicon-m-bookmark', 'before')
                ->icon('heroicon-o-bookmark')
                ->color('info'),
        ];
    }
}
