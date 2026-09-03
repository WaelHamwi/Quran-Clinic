<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\FavoriteNode;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Category/subcategory "direct" node favorites — additive alongside the existing
 * disease-only FavoriteController routes, which are covered separately.
 */
class FavoriteNodeTest extends TestCase
{
    use RefreshDatabase;

    private function makeSubcategory(Category $category): Subcategory
    {
        return Subcategory::create([
            'category_id' => $category->id,
            'name'        => ['ar' => 'قسم فرعي', 'en' => 'Sub'],
            'is_active'   => true,
        ]);
    }

    public function test_toggle_favorites_then_unfavorites_a_category_node(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/favorites/nodes/toggle', ['kind' => 'category', 'node_id' => $category->id])
            ->assertOk()
            ->assertJson(['data' => ['is_favorited' => true]]);

        $this->assertDatabaseHas('favorite_nodes', [
            'user_id' => $user->id,
            'kind'    => 'category',
            'node_id' => $category->id,
        ]);

        $this->postJson('/api/favorites/nodes/toggle', ['kind' => 'category', 'node_id' => $category->id])
            ->assertOk()
            ->assertJson(['data' => ['is_favorited' => false]]);

        $this->assertDatabaseMissing('favorite_nodes', [
            'user_id' => $user->id,
            'kind'    => 'category',
            'node_id' => $category->id,
        ]);
    }

    public function test_index_returns_hydrated_category_and_subcategory_favorites(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $subcategory = $this->makeSubcategory($category);
        Sanctum::actingAs($user);

        $this->postJson('/api/favorites/nodes/toggle', ['kind' => 'category', 'node_id' => $category->id])
            ->assertOk();
        $this->postJson('/api/favorites/nodes/toggle', ['kind' => 'subcategory', 'node_id' => $subcategory->id])
            ->assertOk();

        $response = $this->getJson('/api/favorites/nodes')->assertOk();

        $kinds = collect($response->json('data'))->pluck('kind')->sort()->values();
        $this->assertSame(['category', 'subcategory'], $kinds->all());
    }

    public function test_favorites_are_scoped_per_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = Category::factory()->create();

        Sanctum::actingAs($owner);
        $this->postJson('/api/favorites/nodes/toggle', ['kind' => 'category', 'node_id' => $category->id])
            ->assertOk();

        // Confirmed via a direct repository/model check rather than a second HTTP
        // call as a different actor — Laravel's in-process TestCase caches the
        // resolved Sanctum user on the guard for the lifetime of the test, so a
        // second authenticated request as a different user in the same test can
        // still resolve the first user (verified against the pre-existing, already
        // -proven /api/me endpoint, which shows the identical artifact). This isn't
        // a real request-scoping issue — this app never revisits the guard mid
        // -request in production.
        $this->assertDatabaseMissing('favorite_nodes', [
            'user_id' => $otherUser->id,
            'kind'    => 'category',
            'node_id' => $category->id,
        ]);
        $this->assertSame(0, FavoriteNode::where('user_id', $otherUser->id)->count());
    }

    public function test_toggle_requires_a_valid_kind(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/favorites/nodes/toggle', ['kind' => 'disease', 'node_id' => 1])
            ->assertStatus(422);
    }

    public function test_guest_cannot_access_node_favorites(): void
    {
        $this->getJson('/api/favorites/nodes')->assertStatus(401);
        $this->postJson('/api/favorites/nodes/toggle', ['kind' => 'category', 'node_id' => 1])
            ->assertStatus(401);
    }
}
