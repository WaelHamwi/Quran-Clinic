<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Disease;
use App\Models\Subcategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Exercises the actual production migration (2026_08_22_000002) against
 * pre-existing legacy-owned recordings — the exact situation it will run
 * into on the live database. Uses more than one chunkById() page (500 rows)
 * to guard against a real bug this caught: whereNotNull()->orWhereNotNull()
 * chained without grouping combines with chunkById's own appended
 * "AND id > ?" cursor clause using SQL's normal AND-before-OR precedence,
 * silently dropping rows that aren't the last OR term once a second chunk
 * is fetched. Every legacy row must survive the backfill, not just the
 * first page.
 */
class RecordingAttachmentsBackfillMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_backfill_migrates_every_legacy_owned_recording_across_chunk_boundaries(): void
    {
        $disease = Disease::factory()->create();
        $directCategory = Category::factory()->create(['type' => 'direct']);
        $standardCategory = Category::factory()->create(['type' => 'standard']);
        $subcategory = Subcategory::create([
            'category_id' => $standardCategory->id,
            'name'        => ['ar' => 'قسم', 'en' => 'Sub'],
            'is_active'   => true,
        ]);

        DB::table('recording_attachments')->truncate();
        DB::table('recordings')->truncate();

        $now  = now();
        $base = [
            'session_number' => 1,
            'type'           => 'summarized',
            'is_general'     => false,
            'plays_count'    => 0,
            'created_at'     => $now,
            'updated_at'     => $now,
        ];

        $rows = [];

        // 600 disease-owned rows — enough to push chunkById(500) into a second page.
        for ($i = 0; $i < 600; $i++) {
            $rows[] = [...$base, 'disease_id' => $disease->id, 'category_id' => null, 'subcategory_id' => null];
        }

        // These land in the SECOND chunk (past id 500-ish) — exactly where the
        // OR/AND precedence bug would previously have silently dropped them.
        $rows[] = [...$base, 'disease_id' => null, 'category_id' => $directCategory->id, 'subcategory_id' => null];
        $rows[] = [...$base, 'disease_id' => null, 'category_id' => null, 'subcategory_id' => $subcategory->id];

        DB::table('recordings')->insert($rows);

        $migration = require database_path('migrations/2026_08_22_000002_backfill_recording_attachments.php');
        $migration->up();

        $this->assertSame(602, DB::table('recording_attachments')->count(), 'Every legacy-owned row must be backfilled, including across chunk boundaries.');
        $this->assertSame(600, DB::table('recording_attachments')->where('attachable_type', Disease::class)->count());
        $this->assertSame(1, DB::table('recording_attachments')->where('attachable_type', Category::class)->count());
        $this->assertSame(1, DB::table('recording_attachments')->where('attachable_type', Subcategory::class)->count());
    }

    public function test_backfill_is_idempotent_when_run_twice(): void
    {
        $disease = Disease::factory()->create();

        DB::table('recording_attachments')->truncate();
        DB::table('recordings')->truncate();

        DB::table('recordings')->insert([
            'disease_id'     => $disease->id,
            'category_id'    => null,
            'subcategory_id' => null,
            'session_number' => 1,
            'type'           => 'summarized',
            'is_general'     => false,
            'plays_count'    => 0,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        $migration = require database_path('migrations/2026_08_22_000002_backfill_recording_attachments.php');
        $migration->up();
        $migration->up();

        $this->assertSame(1, DB::table('recording_attachments')->count(), 'Re-running the backfill must not create duplicate links.');
    }
}
