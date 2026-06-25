<?php

namespace Tests\Feature\Console;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Tests\TestCase;

class QueueHealthCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_reports_healthy_when_backlog_is_empty(): void
    {
        Queue::fake();

        $this->artisan('queue:health')
            ->expectsOutputToContain('Queue healthy.')
            ->assertExitCode(0);
    }

    public function test_exits_nonzero_when_backlog_exceeds_threshold(): void
    {
        Queue::shouldReceive('size')->andReturn(100);

        $this->artisan('queue:health', ['--max-pending' => 50])
            ->assertExitCode(1);
    }

    public function test_warns_about_failed_jobs_but_stays_healthy(): void
    {
        Queue::fake();

        DB::table('failed_jobs')->insert([
            'uuid'       => (string) Str::uuid(),
            'connection' => 'database',
            'queue'      => 'default',
            'payload'    => '{}',
            'exception'  => 'boom',
            'failed_at'  => now(),
        ]);

        $this->artisan('queue:health')
            ->expectsOutputToContain('failed job')
            ->assertExitCode(0);
    }
}
