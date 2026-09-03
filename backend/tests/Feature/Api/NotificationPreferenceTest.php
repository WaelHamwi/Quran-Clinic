<?php

namespace Tests\Feature\Api;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationPreferenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_first_ever_fetch_returns_database_defaults_not_nulls(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->assertDatabaseMissing('notification_preferences', ['user_id' => $user->id]);

        $this->getJson('/api/notifications/preferences')
            ->assertOk()
            ->assertJson([
                'data' => [
                    'adhkar_morning_enabled' => true,
                    'adhkar_evening_enabled' => true,
                    'adhkar_sleep_enabled'   => true,
                    'adhkar_waking_enabled'  => true,
                    'waking_delay_minutes'   => 0,
                ],
            ]);
    }

    public function test_existing_preferences_are_returned_unchanged(): void
    {
        $user = User::factory()->create();
        NotificationPreference::create([
            'user_id'                => $user->id,
            'adhkar_morning_enabled' => false,
            'waking_delay_minutes'   => 20,
        ]);
        Sanctum::actingAs($user);

        $this->getJson('/api/notifications/preferences')
            ->assertOk()
            ->assertJson([
                'data' => [
                    'adhkar_morning_enabled' => false,
                    'adhkar_evening_enabled' => true,
                    'waking_delay_minutes'   => 20,
                ],
            ]);
    }

    public function test_waking_delay_is_persisted_and_clamped_by_validation(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/notifications/preferences', ['waking_delay_minutes' => 25])
            ->assertOk()
            ->assertJson(['data' => ['waking_delay_minutes' => 25]]);

        $this->assertDatabaseHas('notification_preferences', [
            'user_id'              => $user->id,
            'waking_delay_minutes' => 25,
        ]);

        $this->postJson('/api/notifications/preferences', ['waking_delay_minutes' => 61])
            ->assertStatus(422);

        $this->postJson('/api/notifications/preferences', ['waking_delay_minutes' => -1])
            ->assertStatus(422);
    }

    public function test_updating_one_toggle_leaves_the_others_at_their_defaults(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/notifications/preferences', ['adhkar_sleep_enabled' => false])
            ->assertOk()
            ->assertJson([
                'data' => [
                    'adhkar_sleep_enabled'   => false,
                    'adhkar_morning_enabled' => true,
                    'adhkar_evening_enabled' => true,
                    'adhkar_waking_enabled'  => true,
                ],
            ]);
    }
}
