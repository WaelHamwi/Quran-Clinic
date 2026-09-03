<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountSuspensionTest extends TestCase
{
    use RefreshDatabase;

    public function test_suspended_user_is_rejected_on_an_authenticated_route(): void
    {
        $user = User::factory()->create(['is_suspended' => true]);
        Sanctum::actingAs($user);

        $this->getJson('/api/me')
            ->assertStatus(403)
            ->assertJson(['error' => 'account_suspended']);
    }

    public function test_active_user_is_unaffected(): void
    {
        $user = User::factory()->create(['is_suspended' => false]);
        Sanctum::actingAs($user);

        $this->getJson('/api/me')->assertOk();
    }

    public function test_reactivated_user_regains_access(): void
    {
        $user = User::factory()->create(['is_suspended' => true]);
        Sanctum::actingAs($user);
        $this->getJson('/api/me')->assertStatus(403);

        // is_suspended is not mass assignable (overposting guard) — reactivate
        // the same way the admin panel does, via forceFill.
        $user->forceFill(['is_suspended' => false, 'suspended_at' => null])->save();

        $this->getJson('/api/me')->assertOk();
    }

    public function test_suspension_does_not_block_public_routes(): void
    {
        $this->getJson('/api/categories')->assertOk();
    }
}
