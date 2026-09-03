<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Covers the refactored auth flow: Controller → AuthService → UserRepository,
 * the logout token-revocation fix, and account deletion moved out of the controller.
 */
class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_persists_user_with_role_and_hashed_password(): void
    {
        Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

        $this->postJson('/api/register', [
            'name'     => 'Wael',
            'email'    => 'wael@example.com',
            'password' => 'password123',
        ])->assertCreated()->assertJsonStructure(['data' => ['user', 'token']]);

        $user = User::where('email', 'wael@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('user'));
        // Created through the repository; the model's hashed cast must apply.
        $this->assertTrue(Hash::check('password123', $user->password));
    }

    public function test_login_succeeds_for_valid_credentials_and_fails_otherwise(): void
    {
        User::factory()->create(['email' => 'a@b.com', 'password' => 'secret123']);

        $this->postJson('/api/login', ['email' => 'a@b.com', 'password' => 'secret123'])
            ->assertOk()->assertJsonStructure(['data' => ['user', 'token']]);

        $this->postJson('/api/login', ['email' => 'a@b.com', 'password' => 'wrong'])
            ->assertStatus(401);
    }

    public function test_logout_revokes_only_the_current_token(): void
    {
        $user = User::factory()->create();
        $keep = $user->createToken('other')->plainTextToken;
        $current = $user->createToken('mobile')->plainTextToken;
        $this->assertSame(2, $user->tokens()->count());

        $this->withHeader('Authorization', "Bearer {$current}")
            ->postJson('/api/logout')
            ->assertOk();

        // The current token is gone; the other session survives.
        $this->assertSame(1, $user->fresh()->tokens()->count());
    }

    public function test_delete_account_force_deletes_the_user_and_all_tokens(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('mobile')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/account')
            ->assertOk();

        // forceDelete() — the row is actually gone, not soft-deleted.
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
    }
}
