<?php

namespace Tests\Feature;

use App\Exceptions\BusinessRuleException;
use App\Models\Recording;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * A Recording's text is reusable content shared across every place it's
 * attached — two recordings must not carry the exact same Arabic or English
 * description, or admins would end up with indistinguishable duplicates.
 */
class RecordingDescriptionUniquenessTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_second_recording_cannot_reuse_the_same_arabic_description(): void
    {
        Recording::factory()->create(['description' => ['ar' => 'نص الرقية', 'en' => 'First']]);

        $this->expectException(BusinessRuleException::class);
        Recording::factory()->create(['description' => ['ar' => 'نص الرقية', 'en' => 'Second']]);
    }

    public function test_a_second_recording_cannot_reuse_the_same_english_description(): void
    {
        Recording::factory()->create(['description' => ['ar' => 'الأول', 'en' => 'Shared text']]);

        $this->expectException(BusinessRuleException::class);
        Recording::factory()->create(['description' => ['ar' => 'الثاني', 'en' => 'Shared text']]);
    }

    public function test_two_recordings_with_no_description_are_both_allowed(): void
    {
        Recording::factory()->create(['description' => null]);
        $second = Recording::factory()->create(['description' => null]);

        $this->assertTrue($second->exists);
    }

    public function test_updating_a_recording_without_changing_its_description_does_not_conflict_with_itself(): void
    {
        $recording = Recording::factory()->create(['description' => ['ar' => 'ثابت', 'en' => 'Stable']]);

        $recording->update(['duration_seconds' => 999]);

        $this->assertSame(999, $recording->fresh()->duration_seconds);
    }

    public function test_distinct_descriptions_are_both_allowed(): void
    {
        Recording::factory()->create(['description' => ['ar' => 'الأول', 'en' => 'First']]);
        $second = Recording::factory()->create(['description' => ['ar' => 'الثاني', 'en' => 'Second']]);

        $this->assertTrue($second->exists);
    }
}
