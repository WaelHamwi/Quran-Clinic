<?php

namespace Tests\Feature\Admin;

use App\Models\Recording;
use App\Models\Subcategory;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\Fixtures\CategoryFormHost;
use Tests\Fixtures\SubcategoryFormHost;
use Tests\TestCase;

/**
 * The recordings section used to disappear entirely on a category that was not
 * type "direct", which reads as "this CMS cannot link recordings to a category"
 * when the truth is one dropdown away. It now always renders, showing either the
 * pickers or the reason they are not available.
 */
class CategoryRecordingSectionTest extends TestCase
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

    public function test_a_standard_category_explains_why_it_cannot_link_recordings(): void
    {
        Recording::factory()->summarized()->create();

        $html = Livewire::test(CategoryFormHost::class)
            ->set('data.type', 'standard')
            ->html();

        $this->assertStringContainsString('Ruqyah Recordings', $html);
        $this->assertStringContainsString('only when its Type is', $html);
        $this->assertStringNotContainsString('mq-rp-list', $html);
    }

    public function test_choosing_direct_reveals_the_pickers(): void
    {
        Recording::factory()->summarized()->create([
            'description' => ['ar' => 'نص الرقية للاختبار', 'en' => 'Ruqyah text'],
        ]);

        $html = Livewire::test(CategoryFormHost::class)
            ->set('data.type', 'direct')
            ->html();

        $this->assertStringContainsString('mq-rp-list', $html);
        $this->assertStringContainsString('نص الرقية للاختبار', $html);
        $this->assertStringNotContainsString('only when its Type is', $html);
    }

    public function test_a_disease_direct_category_also_gets_the_explanation(): void
    {
        $html = Livewire::test(CategoryFormHost::class)
            ->set('data.type', 'disease_direct')
            ->html();

        $this->assertStringContainsString('only when its Type is', $html);
        $this->assertStringNotContainsString('mq-rp-list', $html);
    }

    public function test_a_subcategory_holding_diseases_explains_why_it_cannot_link_recordings(): void
    {
        Recording::factory()->summarized()->create();

        $html = Livewire::test(SubcategoryFormHost::class)
            ->set('data.type', Subcategory::TYPE_STANDARD)
            ->html();

        $this->assertStringContainsString('Ruqyah Recordings', $html);
        $this->assertStringContainsString('only when &quot;Holds&quot; is set to', $html);
        $this->assertStringNotContainsString('mq-rp-list', $html);
    }

    public function test_a_subcategory_set_to_recordings_reveals_the_pickers(): void
    {
        Recording::factory()->summarized()->create([
            'description' => ['ar' => 'نص الرقية للاختبار', 'en' => 'Ruqyah text'],
        ]);

        $html = Livewire::test(SubcategoryFormHost::class)
            ->set('data.type', Subcategory::TYPE_DIRECT)
            ->html();

        $this->assertStringContainsString('mq-rp-list', $html);
        $this->assertStringContainsString('نص الرقية للاختبار', $html);
    }
}
