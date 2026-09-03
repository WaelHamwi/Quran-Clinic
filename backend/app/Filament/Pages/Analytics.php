<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\ActiveUsersWidget;
use App\Filament\Widgets\MostFavoritedDiseasesWidget;
use App\Filament\Widgets\TopSearchTermsWidget;
use App\Filament\Widgets\UserDemographicsWidget;
use BackedEnum;
use Filament\Pages\Dashboard as BaseDashboard;

class Analytics extends BaseDashboard
{
    protected static string $routePath = 'analytics';

    protected static ?string $title = 'Analytics';

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-chart-bar';

    protected static ?int $navigationSort = -1;

    /**
     * Widgets hosted on this page — the main Dashboard excludes exactly this list.
     *
     * @var list<class-string>
     */
    public const WIDGETS = [
        ActiveUsersWidget::class,
        UserDemographicsWidget::class,
        MostFavoritedDiseasesWidget::class,
        TopSearchTermsWidget::class,
    ];

    public function getWidgets(): array
    {
        return self::WIDGETS;
    }
}
