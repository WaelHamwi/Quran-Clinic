<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class CompressAudioJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 600; // 10 min — covers large WAV/high-bitrate MP3 files

    public function __construct(
        private string $modelClass,
        private int    $modelId,
        private string $relativePath, // path stored in audio_path column, e.g. "recordings/abc.mp3"
    ) {
        Log::info("CompressAudioJob: queued {$relativePath} for {$modelClass}#{$modelId}");
    }

    public function handle(): void
    {
        Log::info("CompressAudioJob: processing {$this->relativePath} for {$this->modelClass}#{$this->modelId}");

        $absInput = storage_path('app/public/' . ltrim($this->relativePath, '/\\'));

        if (! file_exists($absInput)) {
            Log::warning("CompressAudioJob: file not found — {$absInput}");
            return;
        }

        $info      = pathinfo($absInput);
        $absOutput = $info['dirname'] . DIRECTORY_SEPARATOR . $info['filename'] . '.mp3';
        $absTmp    = $info['dirname'] . DIRECTORY_SEPARATOR . $info['filename'] . '.compress.mp3';

        try {
            $process = new Process([
                'ffmpeg', '-y',
                '-i',       $absInput,
                '-vn',                   // strip any embedded video/artwork
                '-ar',      '44100',     // 44.1 kHz sample rate
                '-ac',      '1',         // mono — halves size, fine for recitation/ruqyah
                '-b:a',     '96k',       // 96 kbps CBR — transparent for voice content
                '-codec:a', 'libmp3lame',
                $absTmp,
            ]);

            $process->setTimeout(600);
            $process->run();

            if (! $process->isSuccessful() || ! file_exists($absTmp)) {
                if (file_exists($absTmp)) {
                    unlink($absTmp);
                }
                throw new \RuntimeException('FFmpeg failed: ' . $process->getErrorOutput());
            }

            rename($absTmp, $absOutput);

            // Delete the original only when it was a different format (e.g. .wav → .mp3)
            if ($absInput !== $absOutput && file_exists($absInput)) {
                unlink($absInput);
            }

            // Derive the new relative path and update the DB if the extension changed
            $pathInfo    = pathinfo($this->relativePath);
            $dir         = ($pathInfo['dirname'] !== '.' ? $pathInfo['dirname'] . '/' : '');
            $newRelative = $dir . $pathInfo['filename'] . '.mp3';

            if ($newRelative !== ltrim($this->relativePath, '/\\')) {
                $model = $this->modelClass::find($this->modelId);
                if ($model) {
                    $model->update(['audio_path' => $newRelative]);
                }
            }

            Log::info("CompressAudioJob: compressed {$this->relativePath}");
        } catch (\Throwable $e) {
            if (file_exists($absTmp)) {
                unlink($absTmp);
            }
            Log::error("CompressAudioJob failed for {$this->relativePath}: {$e->getMessage()}");
            throw $e;
        }
    }
}
