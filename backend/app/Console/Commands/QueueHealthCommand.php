<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

class QueueHealthCommand extends Command
{
    protected $signature = 'queue:health
        {--queue=default : Queue name to inspect}
        {--max-pending=50 : Backlog above which the queue is reported unhealthy}';

    protected $description = 'Report queue backlog and failed jobs; exit non-zero when workers look unhealthy';

    public function handle(): int
    {
        $queue      = (string) $this->option('queue');
        $maxPending = (int) $this->option('max-pending');

        try {
            $pending = Queue::size($queue);
        } catch (\Throwable $e) {
            $this->error('Could not read queue size: ' . $e->getMessage());
            return self::FAILURE;
        }

        $failed = $this->failedCount();

        $this->line("Connection: " . config('queue.default'));
        $this->line("Queue:      {$queue}");
        $this->line("Pending:    {$pending}");
        $this->line("Failed:     {$failed}");

        if ($pending > $maxPending) {
            $this->error("Backlog {$pending} exceeds threshold {$maxPending} — workers may be down or behind.");
            return self::FAILURE;
        }

        if ($failed > 0) {
            $this->warn("There are {$failed} failed job(s). Inspect with `php artisan queue:failed`.");
        }

        $this->info('Queue healthy.');
        return self::SUCCESS;
    }

    private function failedCount(): int
    {
        try {
            return DB::table('failed_jobs')->count();
        } catch (\Throwable) {
            return 0;
        }
    }
}
