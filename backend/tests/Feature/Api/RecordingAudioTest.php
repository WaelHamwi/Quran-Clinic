<?php

namespace Tests\Feature\Api;

use App\Http\Resources\RecordingResource;
use App\Models\Recording;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecordingAudioTest extends TestCase
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

    private function recordingWithFile(string $path, bool $free): Recording
    {
        Storage::disk('local')->put($path, 'binary-audio');
        $factory = Recording::factory()->localFile($path);

        return ($free ? $factory->free() : $factory)->create();
    }

    public function test_unknown_recording_returns_404(): void
    {
        $this->getJson('/api/recordings/999999/audio')->assertNotFound();
    }

    public function test_free_session_streams_for_a_guest(): void
    {
        $recording = $this->recordingWithFile('recordings/free.mp3', free: true);

        $this->get("/api/recordings/{$recording->id}/audio")
            ->assertOk()
            ->assertHeader('X-Accel-Redirect', '/__protected_audio/recordings/free.mp3')
            ->assertHeader('Accept-Ranges', 'bytes')
            ->assertHeader('Content-Type', 'audio/mpeg');
    }

    public function test_premium_session_is_blocked_for_a_guest(): void
    {
        $recording = $this->recordingWithFile('recordings/premium.mp3', free: false);

        $this->getJson("/api/recordings/{$recording->id}/audio")
            ->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_premium_session_streams_for_a_subscriber(): void
    {
        Sanctum::actingAs(User::factory()->create(['is_subscribed' => true]));

        $recording = $this->recordingWithFile('recordings/premium.mp3', free: false);

        $this->get("/api/recordings/{$recording->id}/audio")
            ->assertOk()
            ->assertHeader('X-Accel-Redirect', '/__protected_audio/recordings/premium.mp3');
    }

    public function test_missing_private_file_returns_404(): void
    {
        // Free session so access is granted, but no file was put on the private disk.
        $recording = Recording::factory()->free()->localFile('recordings/gone.mp3')->create();

        $this->getJson("/api/recordings/{$recording->id}/audio")
            ->assertNotFound()
            ->assertJsonPath('message', 'Audio file not found');
    }

    public function test_stream_url_points_to_the_gated_endpoint_not_public_storage(): void
    {
        $recording = Recording::factory()->free()->localFile('recordings/x.mp3')->create();

        $url = $recording->streamUrl();
        $this->assertStringEndsWith("/api/recordings/{$recording->id}/audio", $url);
        $this->assertStringNotContainsString('/storage/', $url);

        $payload = (new RecordingResource($recording))->toArray(request());
        $this->assertSame($url, $payload['audio_url']);
    }
}
