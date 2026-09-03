<?php

namespace App\Console\Commands;

use App\Models\Recording;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class RelocateRecordingAudioCommand extends Command
{
    protected $signature = 'recordings:relocate-audio
                            {--keep : Keep the original public copies instead of deleting them}
                            {--dry-run : Report what would move without copying anything}';

    protected $description = 'Move recording audio from the public disk to the private disk (one-time, idempotent)';

    public function handle(): int
    {
        $public  = Storage::disk('public');
        $private = Storage::disk('local');
        $dryRun  = (bool) $this->option('dry-run');
        $keep    = (bool) $this->option('keep');

        $moved = $already = $missing = 0;

        $recordings = Recording::whereNotNull('audio_path')->get();

        foreach ($recordings as $recording) {
            $path = (string) $recording->audio_path;

            if ($path === '' || str_starts_with($path, 'http')) {
                continue;
            }

            if ($private->exists($path)) {
                $already++;
                if (! $keep && ! $dryRun && $public->exists($path)) {
                    $public->delete($path); // clean up a leftover public copy
                }
                continue;
            }

            if (! $public->exists($path)) {
                $missing++;
                $this->warn("Missing on both disks: {$path} (recording #{$recording->id})");
                continue;
            }

            if ($dryRun) {
                $this->line("Would move: {$path}");
                $moved++;
                continue;
            }

            $stream = $public->readStream($path);
            $private->writeStream($path, $stream);
            if (is_resource($stream)) {
                fclose($stream);
            }

            if (! $private->exists($path)) {
                $this->error("Copy failed: {$path}");
                continue;
            }

            if (! $keep) {
                $public->delete($path);
            }
            $moved++;
        }

        $verb = $dryRun ? 'Would move' : 'Moved';
        $this->info("{$verb}: {$moved} | already private: {$already} | missing: {$missing}");

        return self::SUCCESS;
    }
}
