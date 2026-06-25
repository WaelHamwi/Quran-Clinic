<?php

namespace App\Providers\Filament;

use App\Filament\Pages\EditProfile;
use Filament\Enums\ThemeMode;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Pages;
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
                NavigationGroup::make('Quran')
                    ->label('The Quran')
                    ->icon('heroicon-o-book-open'),
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
            ->pages([Pages\Dashboard::class])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')

            // ── Custom CSS injected into <head> ───────────────────────
            ->renderHook(
                PanelsRenderHook::HEAD_END,
                fn (): HtmlString => new HtmlString($this->customStyles()),
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

    private function customStyles(): string
    {
        return <<<'CSS'
<style>
/* ================================================================
   QURAN ADMIN — Visual Theme v2
   Light: Pearl Blue  ·  Dark: Deep Navy  ·  Glassmorphism
   ================================================================ */

/* ── Color-scheme hint (suppresses browser contrast warnings) ─── */
:root { color-scheme: light; }
.dark { color-scheme: dark; }

/* ── Page background ─────────────────────────────────────────── */
/* Light: clean pearl-blue — nothing green-tinted */
body {
    background-color: #EEF2FF;
    background-image:
        radial-gradient(ellipse 70% 55% at 8%  8%,  rgba(99,102,241,.08) 0%, transparent 65%),
        radial-gradient(ellipse 55% 45% at 92% 92%, rgba(16,185,129,.06) 0%, transparent 60%),
        radial-gradient(ellipse 40% 35% at 52% 48%, rgba(56,189,248,.04)  0%, transparent 55%);
    min-height: 100vh;
    transition: background-color .35s ease;
}

/* Dark: midnight navy */
.dark body {
    background-color: #040C1E;
    background-image:
        radial-gradient(ellipse 65% 50% at 12% 8%,  rgba(99,102,241,.09)  0%, transparent 68%),
        radial-gradient(ellipse 55% 45% at 88% 90%, rgba(16,185,129,.06)  0%, transparent 62%),
        radial-gradient(ellipse 38% 32% at 50% 50%, rgba(56,189,248,.04)  0%, transparent 55%);
}

/* ── Sidebar ─────────────────────────────────────────────────── */
.fi-sidebar {
    background: rgba(245,247,255,.95) !important;
    backdrop-filter: blur(24px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
    border-right: 1px solid rgba(99,102,241,.1) !important;
    box-shadow: 4px 0 28px rgba(99,102,241,.07) !important;
}

.dark .fi-sidebar {
    background: rgba(3,8,24,.97) !important;
    border-right-color: rgba(99,102,241,.12) !important;
    box-shadow: 4px 0 32px rgba(0,0,0,.65) !important;
}

/* sidebar brand strip */
.fi-sidebar-header {
    background: linear-gradient(135deg, rgba(99,102,241,.1), rgba(16,185,129,.07)) !important;
    border-bottom: 1px solid rgba(99,102,241,.12) !important;
}

.dark .fi-sidebar-header {
    background: linear-gradient(135deg, rgba(99,102,241,.12), rgba(16,185,129,.06)) !important;
    border-bottom-color: rgba(99,102,241,.1) !important;
}

/* sidebar nav items */
.fi-sidebar-item-btn {
    border-radius: 10px !important;
    margin: 1px 8px !important;
    transition: background .18s ease, transform .18s ease, box-shadow .18s ease !important;
}

.fi-sidebar-item-btn:hover {
    background: rgba(99,102,241,.1) !important;
    transform: translateX(3px) !important;
    box-shadow: 0 2px 8px rgba(99,102,241,.12) !important;
}

.fi-sidebar-item.fi-active > .fi-sidebar-item-btn {
    background: linear-gradient(135deg, rgba(99,102,241,.18), rgba(16,185,129,.1)) !important;
    box-shadow: 0 2px 14px rgba(99,102,241,.22), inset 0 1px 0 rgba(255,255,255,.12) !important;
}

/* sidebar group labels */
.fi-sidebar-group-label {
    letter-spacing: .07em !important;
    font-size: .68rem !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    opacity: .45 !important;
}

/* ── Topbar ──────────────────────────────────────────────────── */
.fi-topbar {
    background: rgba(245,247,255,.92) !important;
    backdrop-filter: blur(20px) saturate(170%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(170%) !important;
    border-bottom: 1px solid rgba(99,102,241,.09) !important;
    box-shadow: 0 1px 18px rgba(99,102,241,.07) !important;
}

.dark .fi-topbar {
    background: rgba(4,10,28,.94) !important;
    border-bottom-color: rgba(99,102,241,.12) !important;
    box-shadow: 0 1px 20px rgba(0,0,0,.55) !important;
}

/* ── Theme switcher — pill container ────────────────────────── */
.fi-theme-switcher {
    display: flex !important;
    align-items: center !important;
    gap: 2px !important;
    background: rgba(99,102,241,.08) !important;
    border: 1px solid rgba(99,102,241,.14) !important;
    border-radius: 12px !important;
    padding: 3px !important;
}

.dark .fi-theme-switcher {
    background: rgba(99,102,241,.1) !important;
    border-color: rgba(99,102,241,.2) !important;
}

/* individual sun / moon / system buttons */
.fi-theme-switcher-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 30px !important;
    height: 28px !important;
    border-radius: 9px !important;
    color: rgba(99,102,241,.7) !important;
    transition: background .18s ease, color .18s ease, box-shadow .18s ease !important;
    cursor: pointer !important;
}

.fi-theme-switcher-btn:hover {
    background: rgba(99,102,241,.12) !important;
    color: #6366f1 !important;
}

/* active / selected mode button */
.fi-theme-switcher-btn.fi-active {
    background: #6366f1 !important;
    color: #fff !important;
    box-shadow: 0 2px 8px rgba(99,102,241,.4) !important;
}

.dark .fi-theme-switcher-btn.fi-active {
    background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
    box-shadow: 0 2px 12px rgba(99,102,241,.5) !important;
}

/* ── Stats cards ─────────────────────────────────────────────── */
.fi-wi-stats-overview-stat {
    border-radius: 18px !important;
    background: rgba(255,255,255,.95) !important;
    border: 1px solid rgba(99,102,241,.09) !important;
    box-shadow:
        0 4px 20px rgba(99,102,241,.08),
        0 1px 4px rgba(0,0,0,.04) !important;
    transition:
        transform .28s cubic-bezier(.4,0,.2,1),
        box-shadow .28s cubic-bezier(.4,0,.2,1),
        border-color .28s ease !important;
    overflow: hidden !important;
    position: relative !important;
}

/* animated top accent bar */
.fi-wi-stats-overview-stat::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #10b981, #0ea5e9);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .32s cubic-bezier(.4,0,.2,1);
}

.fi-wi-stats-overview-stat:hover {
    transform: translateY(-6px) !important;
    box-shadow:
        0 20px 48px rgba(99,102,241,.14),
        0 6px 18px rgba(0,0,0,.07) !important;
    border-color: rgba(99,102,241,.28) !important;
}

.fi-wi-stats-overview-stat:hover::after {
    transform: scaleX(1);
}

.dark .fi-wi-stats-overview-stat {
    background: rgba(6,14,38,.85) !important;
    border-color: rgba(99,102,241,.12) !important;
    box-shadow:
        0 4px 24px rgba(0,0,0,.55),
        0 1px 4px rgba(0,0,0,.4) !important;
}

.dark .fi-wi-stats-overview-stat:hover {
    border-color: rgba(99,102,241,.38) !important;
    box-shadow:
        0 20px 48px rgba(99,102,241,.14),
        0 4px 18px rgba(0,0,0,.6) !important;
    background: rgba(10,20,55,.92) !important;
}

/* ── Table container ─────────────────────────────────────────── */
.fi-ta-ctn {
    border-radius: 18px !important;
    overflow: hidden !important;
    box-shadow:
        0 4px 20px rgba(99,102,241,.07),
        0 1px 4px rgba(0,0,0,.04) !important;
    border: 1px solid rgba(99,102,241,.08) !important;
    transition: box-shadow .22s ease !important;
}

.fi-ta-ctn:hover {
    box-shadow:
        0 8px 32px rgba(99,102,241,.1),
        0 2px 8px rgba(0,0,0,.05) !important;
}

.dark .fi-ta-ctn {
    box-shadow:
        0 4px 24px rgba(0,0,0,.58),
        0 1px 4px rgba(0,0,0,.4) !important;
    border-color: rgba(99,102,241,.1) !important;
}

.dark .fi-ta-ctn:hover {
    box-shadow:
        0 8px 32px rgba(0,0,0,.68),
        0 2px 8px rgba(0,0,0,.45) !important;
}

/* ── Section / card panels ───────────────────────────────────── */
.fi-section {
    border-radius: 18px !important;
    box-shadow:
        0 2px 14px rgba(99,102,241,.06),
        0 1px 3px rgba(0,0,0,.04) !important;
    border: 1px solid rgba(99,102,241,.08) !important;
    transition: box-shadow .22s ease !important;
    overflow: hidden !important;
}

.dark .fi-section {
    box-shadow:
        0 2px 20px rgba(0,0,0,.52),
        0 1px 4px rgba(0,0,0,.38) !important;
    border-color: rgba(99,102,241,.1) !important;
}

/* ── Chart widget wrapper ─────────────────────────────────────── */
.fi-wi-chart {
    border-radius: 18px !important;
    overflow: hidden !important;
}

/* ── Form inputs ─────────────────────────────────────────────── */
.fi-input-wrp {
    border-radius: 10px !important;
    transition: box-shadow .2s ease !important;
}

.fi-input-wrp:focus-within {
    box-shadow: 0 0 0 3px rgba(99,102,241,.15) !important;
}

/* ── Custom scrollbar ────────────────────────────────────────── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
    background: rgba(99,102,241,.3);
    border-radius: 99px;
}
::-webkit-scrollbar-thumb:hover {
    background: rgba(99,102,241,.55);
}

/* ── Badge rounding ──────────────────────────────────────────── */
.fi-badge { border-radius: 99px !important; }

/* ── Table row hover ─────────────────────────────────────────── */
.fi-ta-row { transition: background-color .14s ease !important; }

/* ── Smooth page transitions (SPA mode) ──────────────────────── */
[wire\:navigate] { transition: opacity .15s ease !important; }
</style>
CSS;
    }
}
