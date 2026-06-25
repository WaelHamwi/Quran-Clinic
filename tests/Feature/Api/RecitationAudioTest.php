<?php

namespace Tests\Feature\Api;

use App\Models\Recitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RecitationAudioTest extends TestCase
{
    use RefreshDatabase;

    public function test_unknown_recitation_returns_404(): void
    {
        $this->getJson('/api/recitations/999999/audio')
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_missing_local_file_returns_404(): void
    {
        Storage::fake('public');

        $recitation = Recitation::factory()->localFile('recitations/missing.mp3')->create();

        $this->getJson("/api/recitations/{$recitation->id}/audio")
            ->assertNotFound()
            ->assertJsonPath('message', 'Audio file not found');
    }

    public function test_local_file_is_offloaded_to_nginx_when_x_accel_enabled(): void
    {
        config(['scalability.audio.use_x_accel' => true]);
        config(['scalability.audio.x_accel_prefix' => '/__audio_internal']);

        Storage::fake('public');
        Storage::disk('public')->put('recitations/surah.mp3', 'binary-audio');

        $recitation = Recitation::factory()->localFile('recitations/surah.mp3')->create();

        $this->get("/api/recitations/{$recitation->id}/audio")
            ->assertOk()
            ->assertHeader('X-Accel-Redirect', '/__audio_internal/recitations/surah.mp3')
            ->assertHeader('Accept-Ranges', 'bytes')
            ->assertHeader('Content-Type', 'audio/mpeg');
    }

    public function test_remote_audio_is_proxied_through_the_server(): void
    {
        Http::fake([
            'cdn.example.com/*' => Http::response('REMOTE-AUDIO-BYTES', 200, [
                'Content-Type'   => 'audio/mpeg',
                'Content-Length' => 18,
            ]),
        ]);

        $recitation = Recitation::factory()
            ->remote('https://cdn.example.com/audio/sample.mp3')
            ->create();

        $this->get("/api/recitations/{$recitation->id}/audio")
            ->assertOk()
            ->assertHeader('Content-Type', 'audio/mpeg')
            ->assertHeader('Accept-Ranges', 'bytes');
    }

    public function test_remote_audio_upstream_error_returns_502(): void
    {
        Http::fake([
            'cdn.example.com/*' => Http::response('not found', 404),
        ]);

        $recitation = Recitation::factory()
            ->remote('https://cdn.example.com/audio/gone.mp3')
            ->create();

        $this->getJson("/api/recitations/{$recitation->id}/audio")
            ->assertStatus(502)
            ->assertJsonPath('message', 'Audio source unavailable');
    }
}
