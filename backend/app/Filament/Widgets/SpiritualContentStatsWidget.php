<?php

namespace App\Filament\Widgets;

use App\Models\AdhkarItem;
use App\Models\Course;
use App\Models\Feedback;
use App\Models\TahsinatCategory;
use App\Models\TahsinatItem;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class SpiritualContentStatsWidget extends BaseWidget
{
    protected static ?int $sort = 5;

    protected static bool $isLazy = false;

    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        $totalAdhkar   = AdhkarItem::count();
        $morningAdhkar = AdhkarItem::whereHas('category', fn ($q) => $q->where('slug', 'morning'))->count();
        $eveningAdhkar = AdhkarItem::whereHas('category', fn ($q) => $q->where('slug', 'evening'))->count();

        $totalTahsinat    = TahsinatItem::count();
        $tahsinatCatCount = TahsinatCategory::count();

        $totalFeedback      = Feedback::count();
        $beneficialFeedback = Feedback::where('was_beneficial', true)->count();
        $beneficialPct      = $totalFeedback > 0
            ? round($beneficialFeedback / $totalFeedback * 100)
            : 0;

        $totalCourses  = Course::count();
        $activeCourses = Course::active()->count();
        $comingSoon    = Course::where('is_coming_soon', true)->count();

        return [
            Stat::make('Adhkar Items', number_format($totalAdhkar))
                ->description("{$morningAdhkar} morning · {$eveningAdhkar} evening")
                ->descriptionIcon('heroicon-m-sun', 'before')
                ->icon('heroicon-o-sun')
                ->color('warning')
                ->chart([2, 5, 10, 18, 28, 40, 54, 70, 88, max($totalAdhkar, 1)]),

            Stat::make('Tahsinat Items', number_format($totalTahsinat))
                ->description("Across {$tahsinatCatCount} categories")
                ->descriptionIcon('heroicon-m-shield-check', 'before')
                ->icon('heroicon-o-shield-check')
                ->color('success')
                ->chart([1, 3, 7, 13, 21, 31, 43, 57, 73, max($totalTahsinat, 1)]),

            Stat::make('Feedback', number_format($totalFeedback))
                ->description("{$beneficialPct}% found beneficial")
                ->descriptionIcon('heroicon-m-chat-bubble-left-right', 'before')
                ->icon('heroicon-o-chat-bubble-left-right')
                ->color('info')
                ->chart([0, 1, 2, 3, 5, 8, 13, 21, 34, max($totalFeedback, 1)]),

            Stat::make('Courses', number_format($totalCourses))
                ->description("{$activeCourses} active · {$comingSoon} coming soon")
                ->descriptionIcon('heroicon-m-academic-cap', 'before')
                ->icon('heroicon-o-academic-cap')
                ->color('primary')
                ->chart([0, 1, 1, 2, 2, 3, 3, 4, 5, max($totalCourses, 1)]),
        ];
    }
}
