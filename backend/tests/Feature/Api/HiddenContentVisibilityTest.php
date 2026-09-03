<?php

namespace Tests\Feature\Api;

use App\Models\Disease;
use App\Models\Recitation;
use App\Models\Reciter;
use App\Models\Recording;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Direct-ID endpoints must honour the same is_active visibility rules as the
 * browse tree — hidden content cannot be fetched or enumerated by guessing IDs.
 */
class HiddenContentVisibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'scalability.audio.use_x_accel' => true,
            'scalability.audio.protected_x_accel_prefix' => '/__protected_audio',
        ]);
        Storage::fake('local');
    }

    private function freeRecordingForDisease(Disease $disease, string $path = 'recordings/hidden.mp3'): Recording
    {
        Storage::disk('local')->put($path, 'binary-audio');

        return Recording::factory()->free()->localFile($path)
            ->attachedTo(Disease::class, $disease->id)
            ->create();
    }

    public function test_recording_of_inactive_disease_is_hidden_from_all_direct_id_endpoints(): void
    {
        $disease   = Disease::factory()->create(['is_active' => false]);
        $recording = $this->freeRecordingForDisease($disease);

        $this->getJson("/api/recordings/{$recording->id}/audio")->assertNotFound();
        $this->getJson("/api/recordings/{$recording->id}/stream")->assertNotFound();
        $this->postJson("/api/recordings/{$recording->id}/play")->assertNotFound();
        $this->getJson("/api/recordings?disease_id={$disease->id}")->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_recording_of_active_disease_stays_reachable(): void
    {
        $disease   = Disease::factory()->create(['is_active' => true]);
        $recording = $this->freeRecordingForDisease($disease, 'recordings/visible.mp3');

        $this->getJson("/api/recordings/{$recording->id}/audio")->assertOk();
        $this->getJson("/api/recordings/{$recording->id}/stream")->assertOk();
        $this->postJson("/api/recordings/{$recording->id}/play")->assertOk();
        $this->getJson("/api/recordings?disease_id={$disease->id}")->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_admin_can_still_preview_recordings_of_inactive_diseases(): void
    {
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $disease   = Disease::factory()->create(['is_active' => false]);
        $recording = $this->freeRecordingForDisease($disease, 'recordings/admin-preview.mp3');

        $this->getJson("/api/recordings/{$recording->id}/audio")->assertOk();
    }

    public function test_inactive_reciter_is_hidden_by_direct_id(): void
    {
        $reciter = Reciter::factory()->create(['is_active' => false]);

        $this->getJson("/api/reciters/{$reciter->id}")->assertNotFound();
    }

    public function test_recitations_of_inactive_reciter_are_hidden(): void
    {
        $recitation = Recitation::factory()->create();
        $recitation->reciter->update(['is_active' => false]);

        $this->getJson("/api/surahs/{$recitation->surah_id}/recitations")
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->getJson("/api/recitations/{$recitation->id}/audio")->assertNotFound();
    }

    public function test_inactive_disease_cannot_be_favorited_or_enumerated(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $hidden = Disease::factory()->create(['is_active' => false]);

        $this->postJson('/api/favorites/toggle', ['disease_id' => $hidden->id])
            ->assertStatus(422);
    }
}
