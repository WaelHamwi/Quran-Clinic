<?php

namespace Tests\Feature;

use App\Models\Recording;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttachTextCodeAudioTest extends TestCase
{
    use RefreshDatabase;

    private string $dir;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->dir = sys_get_temp_dir() . '/audio-' . uniqid();
        mkdir($this->dir);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->dir . '/*') ?: [] as $f) {
            unlink($f);
        }
        @rmdir($this->dir);

        parent::tearDown();
    }

    private function mp3(string $code): void
    {
        file_put_contents($this->dir . '/' . $code . '.mp3', 'fake-audio-' . $code);
    }

    public function test_it_attaches_audio_to_the_recording_with_the_same_code(): void
    {
        $recording = Recording::factory()->create(['code' => 'C001', 'audio_path' => null]);
        $this->mp3('C001');

        $this->artisan('recordings:attach-text-audio', ['dir' => $this->dir])
            ->assertSuccessful();

        $this->assertSame('recordings/C001.mp3', $recording->fresh()->audio_path);
        Storage::disk('local')->assertExists('recordings/C001.mp3');
    }

    public function test_a_decimal_code_keeps_its_exact_filename(): void
    {
        // C041.5 is a real code in the sheet; splitting on the dot would file
        // it as "C041" and overwrite a different recording's audio.
        $recording = Recording::factory()->create(['code' => 'C041.5', 'audio_path' => null]);
        $this->mp3('C041.5');

        $this->artisan('recordings:attach-text-audio', ['dir' => $this->dir])
            ->assertSuccessful();

        $this->assertSame('recordings/C041.5.mp3', $recording->fresh()->audio_path);
    }

    public function test_audio_with_no_matching_recording_is_skipped_not_guessed(): void
    {
        Recording::factory()->create(['code' => 'C001', 'audio_path' => null]);
        $this->mp3('C001');
        $this->mp3('C999');

        $this->artisan('recordings:attach-text-audio', ['dir' => $this->dir])
            ->expectsOutputToContain('C999')
            ->assertSuccessful();

        Storage::disk('local')->assertMissing('recordings/C999.mp3');
        $this->assertSame(0, Recording::where('code', 'C999')->count());
    }

    public function test_dry_run_writes_nothing(): void
    {
        $recording = Recording::factory()->create(['code' => 'C001', 'audio_path' => null]);
        $this->mp3('C001');

        $this->artisan('recordings:attach-text-audio', ['dir' => $this->dir, '--dry-run' => true])
            ->assertSuccessful();

        $this->assertNull($recording->fresh()->audio_path);
        Storage::disk('local')->assertMissing('recordings/C001.mp3');
    }

    public function test_rerunning_is_idempotent(): void
    {
        $recording = Recording::factory()->create(['code' => 'C001', 'audio_path' => null]);
        $this->mp3('C001');

        $this->artisan('recordings:attach-text-audio', ['dir' => $this->dir])->assertSuccessful();
        $this->artisan('recordings:attach-text-audio', ['dir' => $this->dir])->assertSuccessful();

        $this->assertSame('recordings/C001.mp3', $recording->fresh()->audio_path);
        $this->assertCount(1, Storage::disk('local')->files('recordings'));
    }
}
