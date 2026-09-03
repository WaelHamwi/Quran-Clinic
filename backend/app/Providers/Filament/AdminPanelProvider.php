<?php

namespace App\Providers\Filament;

use App\Filament\Pages\EditProfile;
use Filament\Enums\ThemeMode;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Support\Enums\Width;
use Filament\View\PanelsRenderHook;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\HtmlString;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->profile(EditProfile::class, isSimple: false)

            // ── Branding ──────────────────────────────────────────────
            ->brandName('المشفى القرآني')

            // ── Color palette (Islamic green / teal family) ───────────
            ->colors([
                'primary' => Color::Emerald,
                'gray'    => Color::Slate,
                'info'    => Color::Sky,
                'success' => Color::Teal,
                'warning' => Color::Amber,
                'danger'  => Color::Rose,
            ])

            // ── Typography ────────────────────────────────────────────
            ->font('Noto Kufi Arabic')

            // ── Dark / light mode (user-toggleable, default = system) ─
            ->darkMode()
            ->defaultThemeMode(ThemeMode::System)

            // ── UX ────────────────────────────────────────────────────
            ->spa()
            ->globalSearch()
            ->maxContentWidth(Width::Full)

            // ── Sidebar ───────────────────────────────────────────────
            ->sidebarCollapsibleOnDesktop()
            ->collapsibleNavigationGroups()

            // ── Navigation groups ─────────────────────────────────────
            ->navigationGroups([
                // The Quran group holds only Surahs + Verses, both of which are
                // hidden from the sidebar for now (see SurahResource /
                // VerseResource::shouldRegisterNavigation), so the group has
                // nothing left to render. Restore alongside those resources.
                // NavigationGroup::make('Quran')
                //     ->label('The Quran')
                //     ->icon('heroicon-o-book-open'),
                NavigationGroup::make('Audio')
                    ->label('Audio Content')
                    ->icon('heroicon-o-speaker-wave'),
                NavigationGroup::make('Hospital')
                    ->label('Quranic Hospital')
                    ->icon('heroicon-o-heart'),
                NavigationGroup::make('Adhkar')
                    ->label('Adhkar')
                    ->icon('heroicon-o-sun'),
                NavigationGroup::make('Tahsinat')
                    ->label('Tahsinat')
                    ->icon('heroicon-o-shield-check'),
                NavigationGroup::make('Content')
                    ->label('App Content')
                    ->icon('heroicon-o-rectangle-group'),
                NavigationGroup::make('Engagement')
                    ->label('Engagement')
                    ->icon('heroicon-o-chat-bubble-left-right'),
                NavigationGroup::make('System')
                    ->label('System')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->collapsed(),
            ])

            // ── Resource / Page / Widget discovery ────────────────────
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')

            // ── Custom CSS injected into <head> ───────────────────────
            ->renderHook(
                PanelsRenderHook::HEAD_END,
                fn (): HtmlString => new HtmlString(
                    '<style>'.file_get_contents(resource_path('css/filament/admin-theme.css')).'</style>'
                ),
            )

            // ── Middleware stack ──────────────────────────────────────
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([Authenticate::class]);
    }
}
