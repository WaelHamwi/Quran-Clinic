<?php

namespace Tests\Feature\Admin;

use App\Filament\Resources\Categories\Pages\ManageCategories;
use App\Models\Category;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * The panel runs in the `en` locale, so a plain `name` column resolves to the
 * English translation and the Arabic name — the one the content is authored
 * under — was only visible inside the edit form. The Categories table carries
 * both languages side by side.
 */
class CategoryArabicNameVisibleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin);
    }

    public function test_the_categories_table_shows_both_the_arabic_and_english_name(): void
    {
        Category::factory()->create(['name' => ['ar' => 'أمراض القلب', 'en' => 'Heart diseases']]);

        Livewire::test(ManageCategories::class)
            ->assertTableColumnExists('name')
            ->assertTableColumnExists('name_en')
            ->assertSee('أمراض القلب')
            ->assertSee('Heart diseases');
    }

    /** A missing Arabic name must read as missing, not silently fall back to English. */
    public function test_a_category_without_an_arabic_name_shows_the_placeholder(): void
    {
        Category::factory()->create(['name' => ['en' => 'Heart diseases']]);

        Livewire::test(ManageCategories::class)
            ->assertSee('— not set —')
            ->assertSee('Heart diseases');
    }

    public function test_searching_in_arabic_finds_the_category(): void
    {
        $wanted = Category::factory()->create(['name' => ['ar' => 'أمراض القلب', 'en' => 'Heart diseases']]);
        $other  = Category::factory()->create(['name' => ['ar' => 'الرقية الشرعية', 'en' => 'Ruqyah']]);

        Livewire::test(ManageCategories::class)
            ->searchTable('أمراض القلب')
            ->assertCanSeeTableRecords([$wanted])
            ->assertCanNotSeeTableRecords([$other]);
    }
}
