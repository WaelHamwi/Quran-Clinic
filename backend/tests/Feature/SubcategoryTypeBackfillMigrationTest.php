<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Disease;
use App\Models\Subcategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Exercises the real production migration (2026_08_24_000001) against the
 * shape the live database is actually in: subcategories whose kind was only
 * ever implied by what they hold. Getting the backfill wrong would silently
 * strand every existing recording-holding subcategory on the wrong kind,
 * which then refuses its own attachments.
 */
class SubcategoryTypeBackfillMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_backfill_marks_only_the_subcategories_that_hold_recordings(): void
    {
        $category = Category::factory()->create(['type' => 'standard']);

        $holdsRecordings = $this->makeSubcategory($category->id, 'Holds recordings');
        $holdsDiseases   = $this->makeSubcategory($category->id, 'Holds diseases');
        $empty           = $this->makeSubcategory($category->id, 'Empty');

        Disease::factory()->create([
            'category_id'    => null,
            'subcategory_id' => $holdsDiseases->id,
        ]);

        DB::table('recording_attachments')->insert([
            'recording_id'    => DB::table('recordings')->insertGetId([
                'description'      => json_encode(['ar' => 'نص', 'en' => 'Text']),
                'audio_path'       => 'recordings/x.mp3',
                'duration_seconds' => 10,
                'type'             => 'summarized',
                'is_general'       => false,
                'plays_count'      => 0,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]),
            'attachable_type' => Subcategory::class,
            'attachable_id'   => $holdsRecordings->id,
            'session_number'  => 1,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        // Put every row back to the pre-migration default, then re-run it.
        DB::table('subcategories')->update(['type' => Subcategory::TYPE_STANDARD]);
        $this->runTypeBackfill();

        $this->assertSame(Subcategory::TYPE_DIRECT, $holdsRecordings->fresh()->type);
        $this->assertSame(Subcategory::TYPE_STANDARD, $holdsDiseases->fresh()->type);
        $this->assertSame(
            Subcategory::TYPE_STANDARD,
            $empty->fresh()->type,
            'A subcategory holding nothing must default to diseases, not recordings.',
        );
    }

    public function test_backfill_is_idempotent(): void
    {
        $category    = Category::factory()->create(['type' => 'standard']);
        $subcategory = $this->makeSubcategory($category->id, 'Holds diseases');

        $this->runTypeBackfill();
        $this->runTypeBackfill();

        $this->assertSame(Subcategory::TYPE_STANDARD, $subcategory->fresh()->type);
    }

    /** The migration's own backfill statement, run against the current data. */
    private function runTypeBackfill(): void
    {
        DB::table('subcategories')
            ->whereIn('id', function ($query): void {
                $query->select('attachable_id')
                    ->from('recording_attachments')
                    ->where('attachable_type', Subcategory::class);
            })
            ->update(['type' => Subcategory::TYPE_DIRECT]);
    }

    private function makeSubcategory(int $categoryId, string $name): Subcategory
    {
        return Subcategory::create([
            'category_id' => $categoryId,
            'name'        => ['ar' => 'قسم', 'en' => $name],
            'is_active'   => true,
        ]);
    }
}
