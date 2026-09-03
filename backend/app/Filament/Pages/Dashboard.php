<?php

namespace App\Filament\Pages;

use Filament\Facades\Filament;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    public function getWidgets(): array
    {
        // Analytics widgets live on the dedicated Analytics page only.
        return array_values(array_diff(Filament::getWidgets(), Analytics::WIDGETS));
    }
}
