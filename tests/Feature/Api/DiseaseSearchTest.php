<?php

namespace Tests\Feature\Api;

use App\Models\Disease;
use App\Repositories\Contracts\DiseaseRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiseaseSearchTest extends TestCase
{
    use RefreshDatabase;

    private function repository(): DiseaseRepositoryInterface
    {
        return app(DiseaseRepositoryInterface::class);
    }

    public function test_like_search_matches_english_name(): void
    {
        Disease::factory()->named('صداع', 'Headache')->create();
        Disease::factory()->named('ألم الظهر', 'Backache')->create();

        $results = $this->repository()->search('Head');

        $this->assertCount(1, $results);
        $this->assertSame('Headache', $results->first()->getTranslation('name', 'en'));
    }

    public function test_like_search_matches_arabic_name(): void
    {
        Disease::factory()->named('صداع', 'Headache')->create();

        $results = $this->repository()->search('صد');

        $this->assertCount(1, $results);
    }

    public function test_search_returns_empty_for_unknown_term(): void
    {
        Disease::factory()->named('صداع', 'Headache')->create();

        $this->assertCount(0, $this->repository()->search('xyz-no-match'));
    }

    public function test_fulltext_toggle_falls_back_to_like_on_sqlite(): void
    {
        // FULLTEXT is unsupported on the SQLite test driver; the repository must
        // transparently fall back to LIKE so enabling the flag never breaks search.
        config(['scalability.search.use_fulltext' => true]);

        Disease::factory()->named('صداع', 'Headache')->create();

        $results = $this->repository()->search('Head');

        $this->assertCount(1, $results);
    }
}
