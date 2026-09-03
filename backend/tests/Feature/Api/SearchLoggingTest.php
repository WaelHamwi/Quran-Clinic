<?php

namespace Tests\Feature\Api;

use App\Models\Disease;
use App\Models\SearchLog;
use App\Models\User;
use App\Services\DiseaseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SearchLoggingTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_writes_a_log_row_with_result_count(): void
    {
        Disease::factory()->named('صداع', 'Headache')->create();

        app(DiseaseService::class)->search('Head');

        $this->assertDatabaseHas('search_logs', [
            'term'          => 'Head',
            'results_count' => 1,
        ]);
    }

    public function test_search_log_records_the_authenticated_user(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        app(DiseaseService::class)->search('xyz');

        $this->assertSame($user->id, SearchLog::first()->user_id);
    }

    public function test_guest_search_logs_a_null_user(): void
    {
        app(DiseaseService::class)->search('xyz');

        $this->assertNull(SearchLog::first()->user_id);
    }

    public function test_search_endpoint_still_succeeds_when_logging_is_exercised(): void
    {
        Disease::factory()->named('صداع', 'Headache')->create();

        $this->getJson('/api/diseases/search?q=Head')->assertOk();

        $this->assertDatabaseCount('search_logs', 1);
    }
}
