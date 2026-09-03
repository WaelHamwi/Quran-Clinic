<?php

namespace Tests\Feature\Admin;

use App\Filament\Pages\Analytics;
use App\Filament\Pages\Dashboard;
use App\Filament\Widgets\ActiveUsersWidget;
use App\Filament\Widgets\MostFavoritedDiseasesWidget;
use App\Filament\Widgets\TopSearchTermsWidget;
use App\Filament\Widgets\UserDemographicsWidget;
use App\Models\Category;
use App\Models\Disease;
use App\Models\FavoriteNode;
use App\Models\SearchLog;
use App\Models\User;
use Filament\Facades\Filament;
use Filament\Tables\Table;
use Illuminate\Foundation\Testing\RefreshDatabase;
use ReflectionMethod;
use Tests\TestCase;

/**
 * Widgets have no dedicated UI test harness in this project (matches the
 * existing convention — Filament resources/widgets aren't browser-tested
 * elsewhere). This exercises each new widget's data method directly so a
 * broken query surfaces here instead of only in the live admin panel.
 */
class NewWidgetsSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_users_widget_computes_without_error(): void
    {
        User::factory()->create(['last_active_at' => now()]);

        $widget = new ActiveUsersWidget();
        $method = new ReflectionMethod($widget, 'getStats');
        $method->setAccessible(true);

        $stats = $method->invoke($widget);
        $this->assertCount(2, $stats);
    }

    public function test_user_demographics_widget_computes_without_error(): void
    {
        User::factory()->create(['gender' => 'male']);
        User::factory()->create(['gender' => 'female']);
        User::factory()->create(['gender' => null]);

        $widget = new UserDemographicsWidget();
        $method = new ReflectionMethod($widget, 'getData');
        $method->setAccessible(true);

        $data = $method->invoke($widget);
        $this->assertSame([1, 1, 1], $data['datasets'][0]['data']);
    }

    public function test_most_favorited_diseases_widget_computes_without_error(): void
    {
        $disease = Disease::factory()->named('صداع', 'Headache')->create();
        $user = User::factory()->create();
        $disease->favoritedBy()->attach($user->id);

        $widget = new MostFavoritedDiseasesWidget();
        $method = new ReflectionMethod($widget, 'getData');
        $method->setAccessible(true);

        $data = $method->invoke($widget);
        $this->assertSame([1], $data['datasets'][0]['data']);
    }

    public function test_most_favorited_widget_includes_node_favorites(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['name' => ['ar' => 'الأمراض العضوية', 'en' => 'Organic Diseases']]);
        FavoriteNode::create(['user_id' => $user->id, 'kind' => 'category', 'node_id' => $category->id]);

        $widget = new MostFavoritedDiseasesWidget();
        $method = new ReflectionMethod($widget, 'getData');
        $method->setAccessible(true);

        $data = $method->invoke($widget);
        $this->assertSame([1], $data['datasets'][0]['data']);
        // Chart labels are truncated, so they carry the Arabic name alone —
        // the one the content is authored under — rather than both languages.
        $this->assertSame(['الأمراض العضوية'], $data['labels']);
    }

    public function test_top_search_terms_widget_query_executes_without_error(): void
    {
        SearchLog::create(['term' => 'headache', 'results_count' => 3, 'created_at' => now()]);
        SearchLog::create(['term' => 'headache', 'results_count' => 3, 'created_at' => now()]);
        SearchLog::create(['term' => 'backache', 'results_count' => 1, 'created_at' => now()]);

        $widget = new TopSearchTermsWidget();
        $table = $widget->table(new Table($widget));
        $rows = $table->getQuery()->get();

        $this->assertCount(2, $rows);
        $this->assertSame(2, (int) $rows->firstWhere('term', 'headache')->searches);
    }

    public function test_analytics_page_hosts_widgets_that_the_dashboard_excludes(): void
    {
        $analytics = app(Analytics::class);
        $this->assertSame(Analytics::WIDGETS, $analytics->getWidgets());

        Filament::setCurrentPanel(Filament::getPanel('admin'));
        $dashboardWidgets = app(Dashboard::class)->getWidgets();

        $this->assertNotEmpty($dashboardWidgets);
        $this->assertEmpty(array_intersect(Analytics::WIDGETS, $dashboardWidgets));
    }
}
