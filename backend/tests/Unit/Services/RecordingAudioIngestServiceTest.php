<?php

namespace Tests\Unit\Services;

use App\Services\Audio\FfmpegAudioMerger;
use App\Services\RecordingAudioIngestService;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RecordingAudioIngestServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_no_files_returns_null(): void
    {
        $this->assertNull(app(RecordingAudioIngestService::class)->ingest([]));
    }

    public function test_blank_entries_are_ignored(): void
    {
        Storage::disk('local')->put('recordings/only.mp3', 'audio-bytes');

        $result = app(RecordingAudioIngestService::class)->ingest([null, '', 'recordings/only.mp3']);

        $this->assertSame('recordings/only.mp3', $result);
    }

    public function test_a_single_file_is_used_as_is_without_merging(): void
    {
        Storage::disk('local')->put('recordings/only.mp3', 'audio-bytes');

        $merger = $this->mock(FfmpegAudioMerger::class);
        $merger->shouldNotReceive('merge');

        $result = app(RecordingAudioIngestService::class)->ingest(['recordings/only.mp3']);

        $this->assertSame('recordings/only.mp3', $result);
        Storage::disk('local')->assertExists('recordings/only.mp3');
    }

    public function test_multiple_files_are_merged_in_order_and_fragments_are_deleted(): void
    {
        Storage::disk('local')->put('recordings/a.mp3', 'a');
        Storage::disk('local')->put('recordings/b.mp3', 'b');
        Storage::disk('local')->put('recordings/c.mp3', 'c');

        $fake = new FakeFfmpegAudioMerger();
        $this->app->instance(FfmpegAudioMerger::class, $fake);

        $result = app(RecordingAudioIngestService::class)->ingest([
            'recordings/a.mp3', 'recordings/b.mp3', 'recordings/c.mp3',
        ]);

        $this->assertNotNull($result);
        $this->assertStringStartsWith('recordings/', $result);
        $this->assertStringEndsWith('.mp3', $result);
        Storage::disk('local')->assertExists($result);

        // Fragments are cleaned up once merged — only the merged file remains.
        Storage::disk('local')->assertMissing('recordings/a.mp3');
        Storage::disk('local')->assertMissing('recordings/b.mp3');
        Storage::disk('local')->assertMissing('recordings/c.mp3');

        // Merge order matches the order the admin arranged the files in.
        $this->assertCount(1, $fake->received);
        $this->assertStringEndsWith('a.mp3', $fake->received[0][0]);
        $this->assertStringEndsWith('b.mp3', $fake->received[0][1]);
        $this->assertStringEndsWith('c.mp3', $fake->received[0][2]);
    }
}

class FakeFfmpegAudioMerger extends FfmpegAudioMerger
{
    /** @var list<list<string>> */
    public array $received = [];

    public function merge(array $absoluteInputPaths, string $absoluteOutputPath): void
    {
        $this->received[] = $absoluteInputPaths;
        file_put_contents($absoluteOutputPath, 'merged-fake-audio');
    }
}
