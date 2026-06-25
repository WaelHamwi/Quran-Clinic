<?php

namespace App\Console\Commands;

use App\Jobs\CompressAudioJob;
use App\Models\Recording;
use App\Models\Recitation;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

class CompressExistingAudioCommand extends Command
{
    protected $signature = 'audio:compress
                            {--model=all : Which model to compress: recordings, recitations, or all}
                            {--dry-run   : Show what would be dispatched without actually dispatching}
                            {--sync      : Compress synchronously in the current process (no queue worker needed)}';

    protected $description = 'Compress local audio files to MP3 96kbps. Dispatches to queue by default; use --sync to run inline (e.g. from seeders).';

    public function handle(): int
    {
        $model  = $this->option('model');
        $dryRun = (bool) $this->option('dry-run');

        if ($dryRun) {
            $this->warn('DRY RUN — no jobs will be dispatched.');
        }

        $total = 0;

        if (in_array($model, ['recordings', 'all'])) {
            $total += $this->processModel(
                Recording::class,
                Recording::whereNotNull('audio_path')->get(),
                $dryRun,
            );
        }

        if (in_array($model, ['recitations', 'all'])) {
            // Only local files — skip external CDN URLs
            $total += $this->processModel(
                Recitation::class,
                Recitation::whereNotNull('audio_path')
                    ->where('audio_path', 'not like', 'http%')
                    ->get(),
                $dryRun,
            );
        }

        $verb = $dryRun ? 'Would dispatch' : 'Dispatched';
        $this->info("{$verb} {$total} compression job(s).");

        if (! $dryRun && $total > 0 && ! $this->option('sync')) {
            $this->line('Run <comment>php artisan queue:work --stop-when-empty</comment> to process them.');
        }

        return Command::SUCCESS;
    }

    private function processModel(string $modelClass, Collection $records, bool $dryRun): int
    {
        $shortName = class_basename($modelClass);
        $sync      = (bool) $this->option('sync');
        $count     = 0;

        $bar = $this->output->createProgressBar($records->count());
        $bar->setFormat(" {$shortName}: %current%/%max% [%bar%] %percent:3s%%");
        $bar->start();

        foreach ($records as $record) {
            $path = $record->audio_path;

            if (! $path || str_starts_with($path, 'http')) {
                $bar->advance();
                continue;
            }

            if (! $dryRun) {
                if ($sync) {
                    (new CompressAudioJob($modelClass, $record->id, $path))->handle();
                } else {
                    CompressAudioJob::dispatch($modelClass, $record->id, $path);
                }
            }

            $count++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        return $count;
    }
}
