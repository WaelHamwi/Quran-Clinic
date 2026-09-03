<?php

namespace App\Console\Commands;

use App\Models\Recording;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

/**
 * Attaches the per-text-block audio to the recordings imported by
 * recordings:import-text-codes.
 *
 * The source folder holds one mp3 per code — `C001.mp3`, `C041.5.mp3` — so the
 * filename IS the join key; nothing has to be matched by content. Each file is
 * copied onto the 'local' disk under recordings/ and its path stored on the
 * recording carrying that code.
 *
 * A file whose code has no recording is reported and skipped rather than
 * guessed at: it means the sheet and the audio folder disagree, which is a
 * content question, not something to resolve here.
 */
class AttachTextCodeAudio extends Command
{
    protected $signature = 'recordings:attach-text-audio
                            {dir : folder of <code>.mp3 files}
                            {--dry-run : Report what would change without writing}';

    protected $description = 'Attach per-text-block mp3s to the recordings carrying their codes';

    private const SUBDIR = 'recordings';

    public function handle(): int
    {
        $dir = rtrim($this->argument('dir'), '/\\');

        if (! is_dir($dir)) {
            $this->error("No such folder: {$dir}");

            return self::FAILURE;
        }

        $files = glob($dir . DIRECTORY_SEPARATOR . '*.mp3') ?: [];
        $this->info('mp3 files found: ' . count($files));

        $dry     = (bool) $this->option('dry-run');
        $disk    = Storage::disk('local');
        $matched = $orphans = [];

        foreach ($files as $file) {
            $code = pathinfo($file, PATHINFO_FILENAME);

            $recording = Recording::withTrashed()->where('code', $code)->first();

            if (! $recording) {
                $orphans[] = $code;
                continue;
            }

            $matched[] = [$recording, $file, $code];
        }

        $this->info('matched to a recording: ' . count($matched));

        if ($orphans !== []) {
            $this->warn('audio with no recording of that code (skipped): ' . implode(', ', $orphans));
        }

        if ($dry) {
            $this->comment('dry run — nothing written');

            return self::SUCCESS;
        }

        $stored = 0;

        DB::transaction(function () use ($matched, $disk, &$stored) {
            foreach ($matched as [$recording, $file, $code]) {
                $relative = self::SUBDIR . '/' . $code . '.mp3';

                $disk->put($relative, file_get_contents($file));

                $recording->audio_path = $relative;

                $seconds = $this->durationOf($disk->path($relative));
                if ($seconds !== null) {
                    $recording->duration_seconds = $seconds;
                }

                $recording->save();
                $stored++;
            }
        });

        $this->info("audio attached: {$stored}");

        return self::SUCCESS;
    }

    /**
     * Whole seconds from ffprobe, or null when it is unavailable or the file
     * is unreadable — a missing duration only costs the card its "2:15" label,
     * so it must never abort the attach.
     */
    private function durationOf(string $absolutePath): ?int
    {
        try {
            $probe = new Process([
                'ffprobe', '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                $absolutePath,
            ]);
            $probe->setTimeout(30);
            $probe->run();

            if (! $probe->isSuccessful()) {
                return null;
            }

            $seconds = (float) trim($probe->getOutput());

            return $seconds > 0 ? (int) round($seconds) : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
