<?php

namespace Tests\Feature;

use App\Exceptions\BusinessRuleException;
use App\Models\Recording;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * A recording's code is the handle it is identified by — the same code the
 * ruqyah is filed under in the source spreadsheet. Recordings have no title,
 * only a body of Arabic text, so the code is what an admin picks one by on the
 * Category / Subcategory / Disease forms; two live recordings sharing one would
 * make that choice ambiguous.
 */
class RecordingCodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_code_is_stored_exactly_as_the_sheet_writes_it(): void
    {
        // No format is imposed — whatever the sheet uses has to survive intact.
        foreach (['ORG-01-S', 'R.12.4', 'ر-٧', '3A'] as $code) {
            $recording = Recording::factory()->create(['code' => $code]);

            $this->assertSame($code, $recording->fresh()->code);
        }
    }

    public function test_a_second_recording_cannot_reuse_a_live_code(): void
    {
        Recording::factory()->create(['code' => 'ORG-01-S']);

        $this->expectException(BusinessRuleException::class);
        Recording::factory()->create(['code' => 'ORG-01-S']);
    }

    public function test_a_deleted_recording_releases_its_code(): void
    {
        Recording::factory()->create(['code' => 'ORG-01-S'])->delete();

        $replacement = Recording::factory()->create(['code' => 'ORG-01-S']);

        $this->assertSame('ORG-01-S', $replacement->fresh()->code);
    }

    public function test_saving_a_recording_without_touching_its_code_does_not_conflict_with_itself(): void
    {
        $recording = Recording::factory()->create(['code' => 'ORG-01-S']);

        $recording->update(['duration_seconds' => 42]);

        $this->assertSame(42, $recording->fresh()->duration_seconds);
        $this->assertSame('ORG-01-S', $recording->fresh()->code);
    }

    public function test_surrounding_and_repeated_whitespace_is_tidied_away(): void
    {
        $recording = Recording::factory()->create(['code' => "  ORG   01  "]);

        $this->assertSame('ORG 01', $recording->fresh()->code);
    }

    public function test_a_blank_code_stays_blank(): void
    {
        // Nothing is invented to fill the gap: only the source sheet says what
        // a recording's code is, and a made-up `R-0007` is indistinguishable
        // from a real one in the table.
        foreach ([null, '', '   '] as $blank) {
            $recording = Recording::factory()->create(['code' => $blank]);

            $this->assertNull($recording->fresh()->code);
        }
    }

    public function test_many_recordings_may_be_left_uncoded_at_once(): void
    {
        // Blank is not a value the uniqueness rule polices, so a whole import
        // of not-yet-coded recordings does not trip over itself.
        $first  = Recording::factory()->create(['code' => null]);
        $second = Recording::factory()->create(['code' => null]);

        $this->assertNull($first->fresh()->code);
        $this->assertNull($second->fresh()->code);
    }
}
