<?php

namespace Tests\Feature\Api;

use App\Models\Surah;
use App\Models\Verse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class VerseSearchTest extends TestCase
{
    use RefreshDatabase;

    /** Fully vowelled Uthmani text — a bare-letter query must still match it. */
    private const VOWELLED = 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ';

    private function seedVerse(): Verse
    {
        $surah = Surah::factory()->create();

        return Verse::create([
            'surah_id'     => $surah->id,
            'verse_number' => 1,
            'text'         => ['ar' => self::VOWELLED, 'en' => 'Indeed, Allah is with the patient.'],
        ]);
    }

    public function test_saving_hook_fills_the_normalized_column(): void
    {
        $verse = $this->seedVerse();

        $this->assertSame(Verse::normalizeArabic(self::VOWELLED), $verse->fresh()->text_norm);
    }

    public function test_arabic_search_matches_undiacritised_input_via_text_norm(): void
    {
        $this->seedVerse();

        $this->getJson('/api/verses/search?q=' . urlencode('الصابرين'))
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_english_search_matches(): void
    {
        $this->seedVerse();

        $this->getJson('/api/verses/search?q=patient')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_no_results_for_unrelated_term(): void
    {
        $this->seedVerse();

        $this->getJson('/api/verses/search?q=' . urlencode('كلمة غير موجودة'))
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_falls_back_to_legacy_scan_when_text_norm_is_missing(): void
    {
        $this->seedVerse();

        // Simulate a database not yet upgraded via `verses:normalize`. The legacy
        // path uses MySQL REGEXP_REPLACE which SQLite lacks, so only the English
        // branch is assertable here — enough to prove the fallback engages
        // instead of the request 500ing.
        Schema::table('verses', function ($table) {
            $table->dropColumn('text_norm');
        });

        $this->getJson('/api/verses/search?q=patient')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_normalize_command_backfills_rows(): void
    {
        $verse = $this->seedVerse();
        $verse->newQuery()->toBase()->update(['text_norm' => null]);

        $this->artisan('verses:normalize')->assertSuccessful();

        $this->assertSame(Verse::normalizeArabic(self::VOWELLED), $verse->fresh()->text_norm);
    }
}
