<?php

namespace Tests\Feature\Cache;

use App\Models\Reciter;
use App\Models\Recitation;
use App\Models\Surah;
use App\Services\RecitationService;
use App\Services\ReciterService;
use App\Services\SurahService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Quran-content list caches: the full collection is cached under one static key
 * and sliced into pages in PHP. (Write-side invalidation of these same keys is
 * proven generically for every cached model in CacheInvalidationTest.)
 */
class QuranContentCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_surah_list_is_cached_then_paginated_in_php(): void
    {
        Surah::factory()->count(5)->create();

        $response = $this->getJson('/api/surahs?per_page=2&page=2')->assertOk();

        $this->assertCount(2, $response->json('data'));
        $response->assertJsonPath('meta.total', 5)
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.last_page', 3);

        // The full collection is cached under one static key.
        $this->assertTrue(Cache::has(SurahService::CACHE_ALL));
    }

    public function test_reciter_list_is_cached_then_paginated_in_php(): void
    {
        Reciter::factory()->count(3)->create(['is_active' => true]);

        $response = $this->getJson('/api/reciters?per_page=2')->assertOk();

        $this->assertCount(2, $response->json('data'));
        $response->assertJsonPath('meta.total', 3);
        $this->assertTrue(Cache::has(ReciterService::CACHE_ALL));
    }

    public function test_surah_with_verses_is_served_uncached(): void
    {
        // Verses are a large table read one surah at a time: deliberately uncached
        // (indexed query), so no surahs-with-verses aggregate key is ever written.
        $surah = Surah::factory()->create();

        $this->getJson("/api/surahs/{$surah->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $surah->id);

        $this->assertFalse(Cache::has('surahs.v1.with_verses'));
    }

    public function test_recitations_are_cached_then_filtered_by_surah_in_php(): void
    {
        $wanted = Recitation::factory()->create();
        Recitation::factory()->create(); // a different surah — must be filtered out

        $response = $this->getJson("/api/surahs/{$wanted->surah_id}/recitations")->assertOk();

        $this->assertCount(1, $response->json('data'));
        // The full set is cached under one static key, then filtered by surah_id.
        $this->assertTrue(Cache::has(RecitationService::CACHE_ALL));
    }
}
