<?php

namespace App\Console\Commands;

use App\Jobs\CompressAudioJob;
use App\Models\Recitation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class LocalizeAudioCommand extends Command
{
    protected $signature = 'quran:localize-audio
                            {--reciter_id= : Localize only this reciter\'s audio (omit for all)}
                            {--dry-run : Show what would happen without saving anything}';

    protected $description = 'Download external CDN audio files to local Laravel storage and update recitation records.';

    public function handle(): int
    {
        ini_set('memory_limit', '256M');
        set_time_limit(0);

        $isDryRun  = (bool) $this->option('dry-run');
        $reciterId = $this->option('reciter_id');

        if ($isDryRun) {
            $this->warn('DRY RUN — no files will be saved and no DB records will be updated.');
        }

        $query = Recitation::query()
            ->where('audio_path', 'like', 'http%')
            ->where('reciter_id', '!=', 1);

        if ($reciterId) {
            $query->where('reciter_id', (int) $reciterId);
        }

        $records = $query->get();

        if ($records->isEmpty()) {
            $this->info('No external audio URLs found. Nothing to localize.');
            return Command::SUCCESS;
        }

        $this->info("Found {$records->count()} recitation(s) with external audio URLs.");

        $bar     = $this->output->createProgressBar($records->count());
        $success = 0;
        $failed  = 0;

        $bar->start();

        foreach ($records as $recitation) {
            $destPath    = "audio/reciter_{$recitation->reciter_id}/surah_{$recitation->surah_id}.mp3";
            $absDestPath = storage_path("app/public/{$destPath}");

            try {
                if (! $isDryRun) {
                    $this->downloadWithResume($recitation->audio_path, $absDestPath);
                    $recitation->update(['audio_path' => $destPath]);

                    try {
                        (new CompressAudioJob(Recitation::class, $recitation->id, $destPath))->handle();
                    } catch (\Throwable $e) {
                        Log::warning("LocalizeAudio: compression failed reciter {$recitation->reciter_id} surah {$recitation->surah_id}: {$e->getMessage()}");
                    }
                }
                $success++;
            } catch (\Throwable $e) {
                $failed++;
                Log::error("LocalizeAudio: failed surah {$recitation->surah_id} reciter {$recitation->reciter_id}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        if ($isDryRun) {
            $this->info("DRY RUN complete. Would have localized {$records->count()} file(s).");
            $this->line('Destination pattern: storage/app/public/audio/reciter_{id}/surah_{id}.mp3');
        } else {
            $this->info("Done. Localized: {$success} | Failed: {$failed}");
            if ($failed > 0) {
                $this->warn('Check laravel.log for details on failures.');
            }
        }

        return Command::SUCCESS;
    }

    /**
     * Download a URL to an absolute file path, resuming from an existing
     * partial file when the server supports Range requests (most CDNs do).
     * Retries up to $maxAttempts times with a short backoff between attempts.
     */
    private function downloadWithResume(string $url, string $absPath, int $maxAttempts = 3): void
    {
        $dir = dirname($absPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            $fileHandle = null;

            try {
                $offset     = file_exists($absPath) ? filesize($absPath) : 0;
                $fileHandle = fopen($absPath, $offset > 0 ? 'ab' : 'wb');

                if ($fileHandle === false) {
                    throw new \RuntimeException("Cannot open {$absPath} for writing");
                }

                $guzzleOptions = [
                    'verify'          => true,
                    'sink'            => $fileHandle,  // stream directly to disk — no RAM spike
                    'timeout'         => 600,           // 10 min for large files
                    'connect_timeout' => 30,
                ];

                if ($offset > 0) {
                    // Ask the server to continue from where we left off
                    $guzzleOptions['headers'] = ['Range' => "bytes={$offset}-"];
                }

                $response = Http::withOptions($guzzleOptions)->get($url);

                fclose($fileHandle);
                $fileHandle = null;

                // 200 = full response, 206 = partial content (resume accepted)
                if ($response->successful() || $response->status() === 206) {
                    return;
                }

                // Server returned an error — delete whatever was written
                if (file_exists($absPath)) {
                    unlink($absPath);
                }

                throw new \RuntimeException("HTTP {$response->status()} from {$url}");
            } catch (\Throwable $e) {
                if ($fileHandle !== null && is_resource($fileHandle)) {
                    fclose($fileHandle);
                }

                Log::warning("Download attempt {$attempt} failed for {$url}: {$e->getMessage()}");

                if ($attempt < $maxAttempts) {
                    // 10 s after attempt 1, 20 s after attempt 2
                    sleep(10 * $attempt);
                }
            }
        }

        // All attempts exhausted — remove any partial file so the next run starts clean
        if (file_exists($absPath)) {
            unlink($absPath);
        }

        Log::error("Failed to download {$url} after {$maxAttempts} attempts");
        throw new \RuntimeException("Failed to download {$url} after {$maxAttempts} attempts");
    }
}
