<?php

namespace Tests\Feature\Admin;

use App\Filament\Resources\Recordings\Pages\ManageRecordings;
use App\Models\Recording;
use App\Models\User;
use App\Services\Audio\FfmpegAudioMerger;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Exercises the real Filament Create action end-to-end (not just the
 * underlying service in isolation) to prove the "Recording File(s)" field
 * genuinely accepts more than one upload and merges them, the way an admin
 * would actually use it in the browser.
 */
class RecordingFormMultipleFilesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        Queue::fake(); // CompressAudioJob needs a real ffmpeg binary; not the concern of this test.
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin);
    }

    public function test_the_audio_field_accepts_and_merges_more_than_one_uploaded_file(): void
    {
        $fake = new class extends FfmpegAudioMerger {
            public array $received = [];

            public function merge(array $absoluteInputPaths, string $absoluteOutputPath): void
            {
                $this->received[] = $absoluteInputPaths;
                file_put_contents($absoluteOutputPath, 'merged-fake-audio');
            }
        };
        $this->app->instance(FfmpegAudioMerger::class, $fake);

        Livewire::test(ManageRecordings::class)
            ->callAction('create', data: [
                'description' => ['ar' => 'وصف الاختبار', 'en' => 'Test description'],
                'audio_files' => [
                    UploadedFile::fake()->create('first.mp3', 50, 'audio/mpeg'),
                    UploadedFile::fake()->create('second.mp3', 50, 'audio/mpeg'),
                ],
                'type' => Recording::TYPE_SUMMARIZED,
            ])
            ->assertHasNoFormErrors();

        $recording = Recording::sole();

        $this->assertNotNull($recording->audio_path, 'The recording should have an audio_path after uploading two files.');
        $this->assertCount(1, $fake->received, 'The merger should have been invoked exactly once.');
        $this->assertCount(2, $fake->received[0], 'Both uploaded files should have been passed to the merger.');
        Storage::disk('local')->assertExists($recording->audio_path);
    }

    public function test_the_audio_field_still_works_with_a_single_uploaded_file(): void
    {
        Livewire::test(ManageRecordings::class)
            ->callAction('create', data: [
                'description' => ['ar' => 'وصف آخر', 'en' => 'Another description'],
                'audio_files' => [
                    UploadedFile::fake()->create('only.mp3', 50, 'audio/mpeg'),
                ],
                'type' => Recording::TYPE_SUMMARIZED,
            ])
            ->assertHasNoFormErrors();

        $recording = Recording::sole();

        $this->assertNotNull($recording->audio_path);
        Storage::disk('local')->assertExists($recording->audio_path);
    }
}
