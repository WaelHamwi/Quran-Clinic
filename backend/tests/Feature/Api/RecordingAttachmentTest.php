<?php

namespace Tests\Feature\Api;

use App\Exceptions\BusinessRuleException;
use App\Models\Category;
use App\Models\Disease;
use App\Models\Recording;
use App\Models\Subcategory;
use App\Services\RecordingAttachmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Locks in the reusable-Recording redesign: a Recording (text + audio) is
 * created standalone and then linked to any number of Categories /
 * Subcategories / Diseases via RecordingAttachmentService — the only
 * supported write path (never the relation's attach()/sync() helpers, since
 * those bypass the RecordingAttachment::booted() business-rule hooks).
 */
class RecordingAttachmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_recording_can_be_attached_to_multiple_diseases_at_once(): void
    {
        $diseaseA = Disease::factory()->create(['is_active' => true]);
        $diseaseB = Disease::factory()->create(['is_active' => true]);
        $recording = Recording::factory()->free()->create();

        $service = app(RecordingAttachmentService::class);
        $service->attach($recording, Disease::class, $diseaseA->id);
        $service->attach($recording, Disease::class, $diseaseB->id);

        $this->getJson("/api/diseases/{$diseaseA->slug}")
            ->assertOk()
            ->assertJsonPath('data.recordings.0.id', $recording->id)
            ->assertJsonPath('data.recordings.0.disease_id', $diseaseA->id)
            ->assertJsonPath('data.recordings.0.category_id', null);

        $this->getJson("/api/diseases/{$diseaseB->slug}")
            ->assertOk()
            ->assertJsonPath('data.recordings.0.id', $recording->id)
            ->assertJsonPath('data.recordings.0.disease_id', $diseaseB->id);
    }

    public function test_a_disease_can_hold_several_recordings_of_the_same_type(): void
    {
        $disease = Disease::factory()->create(['is_active' => true]);
        $first   = Recording::factory()->free()->create();
        $second  = Recording::factory()->free()->create();

        $service = app(RecordingAttachmentService::class);
        $service->attach($first, Disease::class, $disease->id);
        $service->attach($second, Disease::class, $disease->id);

        $this->assertEqualsCanonicalizing(
            [$first->id, $second->id],
            $disease->recordings()->pluck('recordings.id')->all(),
        );

        $this->getJson("/api/diseases/{$disease->slug}")
            ->assertOk()
            ->assertJsonCount(2, 'data.recordings');
    }

    public function test_the_same_recording_can_be_linked_to_one_item_more_than_once(): void
    {
        // A ruqyah repeats itself — the opening passage comes back in the
        // middle and closes the session. Each occurrence is its own row with
        // its own session_number, so the app plays it three times rather than
        // collapsing them into one.
        $disease   = Disease::factory()->create();
        $recording = Recording::factory()->free()->create();

        $service = app(RecordingAttachmentService::class);
        $service->attach($recording, Disease::class, $disease->id);
        $service->attach($recording, Disease::class, $disease->id);
        $service->attach($recording, Disease::class, $disease->id);

        $this->assertSame(3, $disease->recordings()->count());
        $this->assertSame(
            [1, 2, 3],
            $disease->recordings()->get()->map(fn ($r) => $r->pivot->session_number)->all(),
        );
    }

    public function test_a_repeated_recording_reaches_the_api_once_per_occurrence(): void
    {
        $disease   = Disease::factory()->create(['is_active' => true]);
        $recording = Recording::factory()->free()->create();
        $other     = Recording::factory()->free()->create();

        // Opening, middle, closing: the same recording at positions 1 and 3.
        app(RecordingAttachmentService::class)
            ->syncForAttachable($disease, [$recording->id, $other->id, $recording->id]);

        $response = $this->getJson("/api/diseases/{$disease->slug}")->assertOk();

        $response->assertJsonPath('data.recordings.0.id', $recording->id);
        $response->assertJsonPath('data.recordings.1.id', $other->id);
        $response->assertJsonPath('data.recordings.2.id', $recording->id);

        // The recording id repeats, so it cannot identify a session. The pivot
        // row can, and that is what the app keys the reader and the queue by.
        $first = $response->json('data.recordings.0.attachment_id');
        $last  = $response->json('data.recordings.2.attachment_id');

        $this->assertNotNull($first);
        $this->assertNotSame($first, $last, 'Two occurrences must not share an attachment_id.');
        $this->assertSame([1, 2, 3], $response->json('data.recordings.*.session_number'));
    }

    public function test_a_recording_cannot_be_attached_directly_to_a_subcategory_that_has_diseases(): void
    {
        $category    = Category::factory()->create(['type' => 'standard']);
        $subcategory = Subcategory::create([
            'category_id' => $category->id,
            'name'        => ['ar' => 'قسم', 'en' => 'Sub'],
            'is_active'   => true,
        ]);
        Disease::factory()->create(['category_id' => null, 'subcategory_id' => $subcategory->id]);

        $recording = Recording::factory()->free()->create();

        $this->expectException(BusinessRuleException::class);
        app(RecordingAttachmentService::class)->attach($recording, Subcategory::class, $subcategory->id);
    }

    public function test_sync_detaches_removed_targets_and_attaches_new_ones(): void
    {
        $diseaseA = Disease::factory()->create();
        $diseaseB = Disease::factory()->create();
        $recording = Recording::factory()->free()->create();

        $service = app(RecordingAttachmentService::class);
        $service->attach($recording, Disease::class, $diseaseA->id);

        $service->sync($recording, [Disease::class => [$diseaseB->id]]);

        $recording->refresh();
        $attached = $recording->attachments()->pluck('attachable_id')->all();

        $this->assertSame([$diseaseB->id], $attached);
    }

    public function test_a_recording_attached_to_a_category_and_a_disease_appears_under_both(): void
    {
        $directCategory = Category::factory()->create(['type' => 'direct']);
        $disease        = Disease::factory()->create();
        $recording      = Recording::factory()->detailed()->create();

        $service = app(RecordingAttachmentService::class);
        $service->attach($recording, Category::class, $directCategory->id);
        $service->attach($recording, Disease::class, $disease->id);

        $this->getJson("/api/categories/{$directCategory->slug}")
            ->assertOk()
            ->assertJsonPath('data.recordings.0.id', $recording->id)
            ->assertJsonPath('data.recordings.0.category_id', $directCategory->id)
            ->assertJsonPath('data.recordings.0.disease_id', null);

        $this->getJson("/api/diseases/{$disease->slug}")
            ->assertOk()
            ->assertJsonPath('data.recordings.0.id', $recording->id)
            ->assertJsonPath('data.recordings.0.disease_id', $disease->id)
            ->assertJsonPath('data.recordings.0.category_id', null);
    }
}
