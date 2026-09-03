<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Recording;
use App\Models\Subcategory;
use App\Services\RecordingAttachmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Locks the API flow through the dedicated SubcategoryService:
 * route → SubcategoryController → SubcategoryService → SubcategoryRepository → Resource.
 */
class SubcategoryEndpointTest extends TestCase
{
    use RefreshDatabase;

    private function makeSubcategory(): Subcategory
    {
        $category = Category::factory()->create(); // type 'standard' accepts subcategories

        return Subcategory::create([
            'category_id' => $category->id,
            'name'        => ['ar' => 'قسم فرعي', 'en' => 'Sub'],
            'is_active'   => true,
        ]);
    }

    public function test_show_returns_the_subcategory_with_its_category(): void
    {
        $sub = $this->makeSubcategory();

        $this->getJson("/api/subcategories/{$sub->slug}")
            ->assertOk()
            ->assertJsonPath('data.id', $sub->id)
            ->assertJsonPath('data.slug', $sub->slug)
            ->assertJsonPath('data.category.id', $sub->category_id);
    }

    public function test_unknown_slug_returns_404(): void
    {
        $this->getJson('/api/subcategories/does-not-exist')
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_inactive_subcategory_is_not_found(): void
    {
        $sub = $this->makeSubcategory();
        $sub->update(['is_active' => false]);

        $this->getJson("/api/subcategories/{$sub->slug}")->assertNotFound();
    }

    /**
     * A direct subcategory may hold as many sessions as its content needs, of
     * either type. The app stacks the texts of one type into a single ruqyah,
     * so every attached recording has to come through — truncating to the first
     * would silently drop the rest of the wird.
     */
    public function test_show_returns_every_recording_a_direct_subcategory_holds(): void
    {
        $sub = $this->makeDirectSubcategory();

        $ids = collect([
            Recording::factory()->summarized()->create(),
            Recording::factory()->summarized()->create(),
            Recording::factory()->summarized()->create(),
            Recording::factory()->detailed()->create(),
        ])->pluck('id')->all();

        app(RecordingAttachmentService::class)->syncForAttachable($sub, $ids);

        $response = $this->getJson("/api/subcategories/{$sub->slug}")->assertOk();

        $this->assertSame($ids, array_column($response->json('data.recordings'), 'id'));
    }

    public function test_direct_recordings_come_back_in_session_order(): void
    {
        // session_number is the play order the CMS assigned, so the payload has
        // to arrive already in it — the app does not re-sort by id.
        $sub   = $this->makeDirectSubcategory();
        $first = Recording::factory()->summarized()->create();
        $last  = Recording::factory()->summarized()->create();

        app(RecordingAttachmentService::class)->syncForAttachable($sub, [$last->id, $first->id]);

        $recordings = $this->getJson("/api/subcategories/{$sub->slug}")
            ->assertOk()
            ->json('data.recordings');

        $this->assertSame([$last->id, $first->id], array_column($recordings, 'id'));
        $this->assertSame([1, 2], array_column($recordings, 'session_number'));
        $this->assertSame([$sub->id, $sub->id], array_column($recordings, 'subcategory_id'));
    }

    private function makeDirectSubcategory(): Subcategory
    {
        $category = Category::factory()->create();

        return Subcategory::create([
            'category_id' => $category->id,
            'name'        => ['ar' => 'قسم مباشر', 'en' => 'Direct Sub'],
            'type'        => Subcategory::TYPE_DIRECT,
            'is_active'   => true,
        ]);
    }
}
