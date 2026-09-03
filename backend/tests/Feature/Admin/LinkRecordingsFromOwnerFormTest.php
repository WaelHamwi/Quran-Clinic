<?php

namespace Tests\Feature\Admin;

use App\Exceptions\BusinessRuleException;
use App\Filament\Resources\Categories\Pages\ManageCategories;
use App\Filament\Resources\Diseases\Pages\ManageDiseases;
use App\Filament\Resources\Subcategories\Pages\ManageSubcategories;
use App\Filament\Support\RecordingAttachmentsField;
use App\Models\Category;
use App\Models\Disease;
use App\Models\Recording;
use App\Models\Subcategory;
use App\Models\User;
use App\Services\RecordingAttachmentService;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Drives the real Filament create/edit actions on the Category, Subcategory
 * and Disease forms to prove an admin can tick recordings there — the
 * owner-side half of the linking flow, mirroring the "Manage Attachments"
 * action that links from the recording side.
 */
class LinkRecordingsFromOwnerFormTest extends TestCase
{
    use RefreshDatabase;

    private const SUMMARIZED = RecordingAttachmentsField::SUMMARIZED_KEY;

    private const DETAILED = RecordingAttachmentsField::DETAILED_KEY;

    protected function setUp(): void
    {
        parent::setUp();

        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin);
    }

    public function test_a_disease_can_be_created_with_recordings_ticked(): void
    {
        $category   = Category::factory()->diseaseDirect()->create();
        $summarized = Recording::factory()->summarized()->create();
        $detailed   = Recording::factory()->detailed()->create();

        Livewire::test(ManageDiseases::class)
            ->callAction('create', data: [
                'parent_type'   => 'category',
                'category_id'   => $category->id,
                'name'          => ['ar' => 'صداع', 'en' => 'Headache'],
                'display_order' => 0,
                'is_active'     => true,
                self::SUMMARIZED => [$summarized->id],
                self::DETAILED   => [$detailed->id],
            ])
            ->assertHasNoFormErrors();

        $disease = Disease::sole();

        $this->assertEqualsCanonicalizing(
            [$summarized->id, $detailed->id],
            $disease->recordings()->pluck('recordings.id')->all(),
        );
    }

    public function test_the_same_recording_can_be_linked_to_several_diseases(): void
    {
        $category  = Category::factory()->diseaseDirect()->create();
        $shared    = Recording::factory()->summarized()->create();
        $diseaseA  = Disease::factory()->create(['category_id' => $category->id]);
        $diseaseB  = Disease::factory()->create(['category_id' => $category->id]);

        foreach ([$diseaseA, $diseaseB] as $disease) {
            Livewire::test(ManageDiseases::class)
                ->callAction(TestAction::make('edit')->table($disease), data: [
                    'parent_type'   => 'category',
                    'category_id'   => $category->id,
                    'name'          => $disease->getTranslations('name'),
                    'display_order' => 0,
                    'is_active'     => true,
                    self::SUMMARIZED => [$shared->id],
                    self::DETAILED   => [],
                ])
                ->assertHasNoFormErrors();
        }

        $this->assertSame([$shared->id], $diseaseA->recordings()->pluck('recordings.id')->all());
        $this->assertSame([$shared->id], $diseaseB->recordings()->pluck('recordings.id')->all());
        $this->assertSame(2, $shared->attachments()->count(), 'The one recording should now hold two links.');
    }

    public function test_unticking_a_recording_unlinks_it_without_deleting_it(): void
    {
        $category = Category::factory()->diseaseDirect()->create();
        $disease  = Disease::factory()->create(['category_id' => $category->id]);
        $linked   = Recording::factory()->summarized()->create();

        app(RecordingAttachmentService::class)->attach($linked, Disease::class, $disease->id);

        Livewire::test(ManageDiseases::class)
            ->callAction(TestAction::make('edit')->table($disease), data: [
                'parent_type'   => 'category',
                'category_id'   => $category->id,
                'name'          => $disease->getTranslations('name'),
                'display_order' => 0,
                'is_active'     => true,
                self::SUMMARIZED => [],
                self::DETAILED   => [],
            ])
            ->assertHasNoFormErrors();

        $this->assertSame([], $disease->recordings()->pluck('recordings.id')->all());
        $this->assertDatabaseHas('recordings', ['id' => $linked->id, 'deleted_at' => null]);
    }

    public function test_replacing_an_items_recording_leaves_only_the_new_one(): void
    {
        $category = Category::factory()->diseaseDirect()->create();
        $disease  = Disease::factory()->create(['category_id' => $category->id]);
        $old      = Recording::factory()->summarized()->create();
        $new      = Recording::factory()->summarized()->create();

        app(RecordingAttachmentService::class)->attach($old, Disease::class, $disease->id);

        Livewire::test(ManageDiseases::class)
            ->callAction(TestAction::make('edit')->table($disease), data: [
                'parent_type'   => 'category',
                'category_id'   => $category->id,
                'name'          => $disease->getTranslations('name'),
                'display_order' => 0,
                'is_active'     => true,
                self::SUMMARIZED => [$new->id],
                self::DETAILED   => [],
            ])
            ->assertHasNoFormErrors();

        $this->assertSame([$new->id], $disease->recordings()->pluck('recordings.id')->all());
    }

    public function test_a_direct_category_can_be_created_with_a_recording_ticked(): void
    {
        $recording = Recording::factory()->summarized()->create();

        Livewire::test(ManageCategories::class)
            ->callAction('create', data: [
                'name'          => ['ar' => 'رقية عامة', 'en' => 'General Ruqyah'],
                'type'          => 'direct',
                'display_order' => 0,
                'is_active'     => true,
                self::SUMMARIZED => [$recording->id],
                self::DETAILED   => [],
            ])
            ->assertHasNoFormErrors();

        $category = Category::where('type', 'direct')->sole();

        $this->assertSame([$recording->id], $category->recordings()->pluck('recordings.id')->all());
    }

    public function test_a_subcategory_declared_as_holding_recordings_can_be_created_with_one_ticked(): void
    {
        $parent    = Category::factory()->create(['type' => 'standard']);
        $recording = Recording::factory()->summarized()->create();

        Livewire::test(ManageSubcategories::class)
            ->callAction('create', data: [
                'category_id'   => $parent->id,
                'type'          => Subcategory::TYPE_DIRECT,
                'name'          => ['ar' => 'فرع', 'en' => 'Branch'],
                'display_order' => 0,
                'is_active'     => true,
                self::SUMMARIZED => [$recording->id],
                self::DETAILED   => [],
            ])
            ->assertHasNoFormErrors();

        $subcategory = Subcategory::sole();

        $this->assertSame([$recording->id], $subcategory->recordings()->pluck('recordings.id')->all());
    }

    public function test_a_direct_subcategory_keeps_every_recording_ticked_on_it(): void
    {
        $parent = Category::factory()->create(['type' => 'standard']);
        $first  = Recording::factory()->summarized()->create();
        $second = Recording::factory()->summarized()->create();
        $third  = Recording::factory()->summarized()->create();
        $paid   = Recording::factory()->detailed()->create();

        Livewire::test(ManageSubcategories::class)
            ->callAction('create', data: [
                'category_id'   => $parent->id,
                'type'          => Subcategory::TYPE_DIRECT,
                'name'          => ['ar' => 'فرع', 'en' => 'Branch'],
                'display_order' => 0,
                'is_active'     => true,
                self::SUMMARIZED => [$first->id, $second->id, $third->id],
                self::DETAILED   => [$paid->id],
            ])
            ->assertHasNoFormErrors();

        $this->assertSame(
            [$first->id, $second->id, $third->id, $paid->id],
            Subcategory::sole()->recordings()->pluck('recordings.id')->all(),
        );
    }

    public function test_a_subcategory_that_holds_diseases_refuses_a_recording(): void
    {
        // The kind is declared now, so this no longer waits until the
        // subcategory actually has a disease to refuse.
        $parent = Category::factory()->create(['type' => 'standard']);
        $subcategory = Subcategory::create([
            'category_id' => $parent->id,
            'type'        => Subcategory::TYPE_STANDARD,
            'name'        => ['ar' => 'فرع', 'en' => 'Holds diseases'],
            'is_active'   => true,
        ]);
        $recording = Recording::factory()->summarized()->create();

        $this->expectException(BusinessRuleException::class);
        app(RecordingAttachmentService::class)->attach($recording, Subcategory::class, $subcategory->id);
    }

    public function test_a_subcategory_holding_recordings_refuses_a_disease(): void
    {
        $parent = Category::factory()->create(['type' => 'standard']);
        $subcategory = Subcategory::create([
            'category_id' => $parent->id,
            'type'        => Subcategory::TYPE_DIRECT,
            'name'        => ['ar' => 'فرع', 'en' => 'Holds recordings'],
            'is_active'   => true,
        ]);

        $this->expectException(BusinessRuleException::class);
        Disease::factory()->create(['category_id' => null, 'subcategory_id' => $subcategory->id]);
    }

    public function test_a_subcategory_cannot_change_kind_while_it_holds_content(): void
    {
        $parent = Category::factory()->create(['type' => 'standard']);
        $subcategory = Subcategory::create([
            'category_id' => $parent->id,
            'type'        => Subcategory::TYPE_DIRECT,
            'name'        => ['ar' => 'فرع', 'en' => 'Holds recordings'],
            'is_active'   => true,
        ]);
        $recording = Recording::factory()->summarized()->create();
        app(RecordingAttachmentService::class)->attach($recording, Subcategory::class, $subcategory->id);

        $this->expectException(BusinessRuleException::class);

        $subcategory->type = Subcategory::TYPE_STANDARD;
        $subcategory->save();
    }

    public function test_a_disease_can_be_created_with_several_recordings_of_the_same_type(): void
    {
        $category = Category::factory()->diseaseDirect()->create();
        $first    = Recording::factory()->summarized()->create();
        $second   = Recording::factory()->summarized()->create();
        $third    = Recording::factory()->summarized()->create();

        Livewire::test(ManageDiseases::class)
            ->callAction('create', data: [
                'parent_type'   => 'category',
                'category_id'   => $category->id,
                'name'          => ['ar' => 'مرض', 'en' => 'Some disease'],
                'display_order' => 0,
                'is_active'     => true,
                self::SUMMARIZED => [$first->id, $second->id, $third->id],
                self::DETAILED   => [],
            ])
            ->assertHasNoFormErrors();

        $this->assertEqualsCanonicalizing(
            [$first->id, $second->id, $third->id],
            Disease::sole()->recordings()->pluck('recordings.id')->all(),
        );
    }

    public function test_a_disease_can_hold_the_same_recording_at_the_beginning_middle_and_end(): void
    {
        // The point of the whole sequence model: a ruqyah opens on a passage,
        // moves through another, and returns to the first to close. Three
        // sessions, two recordings.
        $category = Category::factory()->diseaseDirect()->create();
        $opening  = Recording::factory()->summarized()->create();
        $middle   = Recording::factory()->summarized()->create();

        Livewire::test(ManageDiseases::class)
            ->callAction('create', data: [
                'parent_type'   => 'category',
                'category_id'   => $category->id,
                'name'          => ['ar' => 'مرض', 'en' => 'Some disease'],
                'display_order' => 0,
                'is_active'     => true,
                self::SUMMARIZED => [$opening->id, $middle->id, $opening->id],
                self::DETAILED   => [],
            ])
            ->assertHasNoFormErrors();

        $disease = Disease::sole();

        $this->assertSame(
            [$opening->id, $middle->id, $opening->id],
            $disease->recordings()->pluck('recordings.id')->all(),
        );
        $this->assertSame(
            [1, 2, 3],
            $disease->recordings()->get()->map(fn ($r) => $r->pivot->session_number)->all(),
        );
    }

    public function test_the_form_reopens_holding_every_repeat_it_was_saved_with(): void
    {
        // Hydration reads the sequence back for the picker. Collapsing repeats
        // here would silently delete them the next time the form is saved.
        $category = Category::factory()->diseaseDirect()->create();
        $disease  = Disease::factory()->create(['category_id' => $category->id]);
        $opening  = Recording::factory()->summarized()->create();
        $middle   = Recording::factory()->summarized()->create();

        app(RecordingAttachmentService::class)
            ->syncForAttachable($disease, [$opening->id, $middle->id, $opening->id]);

        Livewire::test(ManageDiseases::class)
            ->mountAction(TestAction::make('edit')->table($disease))
            ->assertActionDataSet([
                self::SUMMARIZED => [(string) $opening->id, (string) $middle->id, (string) $opening->id],
            ]);
    }

    public function test_dropping_one_occurrence_leaves_the_others_in_place(): void
    {
        $category = Category::factory()->diseaseDirect()->create();
        $disease  = Disease::factory()->create(['category_id' => $category->id]);
        $repeated = Recording::factory()->summarized()->create();
        $other    = Recording::factory()->summarized()->create();

        $service = app(RecordingAttachmentService::class);
        $service->syncForAttachable($disease, [$repeated->id, $other->id, $repeated->id]);
        $service->syncForAttachable($disease, [$repeated->id, $other->id]);

        $this->assertSame(
            [$repeated->id, $other->id],
            $disease->recordings()->pluck('recordings.id')->all(),
        );
        $this->assertSame(
            [1, 2],
            $disease->recordings()->get()->map(fn ($r) => $r->pivot->session_number)->all(),
        );
    }

    public function test_reordering_a_sequence_renumbers_it_without_replacing_its_rows(): void
    {
        // Reordering must not churn the pivot: the rows carry created_at, and
        // an admin nudging a session up and down should not rewrite history.
        $category = Category::factory()->diseaseDirect()->create();
        $disease  = Disease::factory()->create(['category_id' => $category->id]);
        $a        = Recording::factory()->summarized()->create();
        $b        = Recording::factory()->summarized()->create();

        $service = app(RecordingAttachmentService::class);
        $service->syncForAttachable($disease, [$a->id, $b->id, $a->id]);

        $before = $disease->recordings()->get()->map(fn ($r) => $r->pivot->id)->sort()->values()->all();

        $service->syncForAttachable($disease, [$b->id, $a->id, $a->id]);

        $after = $disease->recordings()->get()->map(fn ($r) => $r->pivot->id)->sort()->values()->all();

        $this->assertSame($before, $after, 'A pure reorder should reuse the existing rows.');
        $this->assertSame(
            [$b->id, $a->id, $a->id],
            $disease->recordings()->pluck('recordings.id')->all(),
        );
    }

    public function test_sessions_are_numbered_in_the_order_they_were_listed(): void
    {
        // session_number is what the app plays in order, so the admin's list
        // order has to land in the pivot as 1, 2, 3 — not the ever-growing
        // numbers the creating() hook hands out.
        $category   = Category::factory()->diseaseDirect()->create();
        $disease    = Disease::factory()->create(['category_id' => $category->id]);
        $summarized = Recording::factory()->summarized()->create();
        $detailed   = Recording::factory()->detailed()->create();
        $second     = Recording::factory()->summarized()->create();

        app(RecordingAttachmentService::class)
            ->syncForAttachable($disease, [$summarized->id, $second->id, $detailed->id]);

        $numbers = $disease->recordings()
            ->get()
            ->mapWithKeys(fn ($r) => [$r->id => $r->pivot->session_number])
            ->all();

        $this->assertSame(1, $numbers[$summarized->id]);
        $this->assertSame(2, $numbers[$second->id]);
        $this->assertSame(3, $numbers[$detailed->id]);
    }

    public function test_renumbering_stays_contiguous_after_an_unlink(): void
    {
        $category = Category::factory()->diseaseDirect()->create();
        $disease  = Disease::factory()->create(['category_id' => $category->id]);
        $a        = Recording::factory()->summarized()->create();
        $b        = Recording::factory()->summarized()->create();
        $c        = Recording::factory()->summarized()->create();

        $service = app(RecordingAttachmentService::class);
        $service->syncForAttachable($disease, [$a->id, $b->id, $c->id]);
        $service->syncForAttachable($disease, [$a->id, $c->id]);

        $numbers = $disease->recordings()
            ->get()
            ->mapWithKeys(fn ($r) => [$r->id => $r->pivot->session_number])
            ->all();

        $this->assertSame([1, 2], array_values($numbers));
        $this->assertSame(1, $numbers[$a->id]);
        $this->assertSame(2, $numbers[$c->id]);
    }

    public function test_saving_a_form_that_hides_the_fields_leaves_existing_links_alone(): void
    {
        // The section is hidden for items that cannot hold recordings, so its
        // keys never reach the save. That absence must not read as "untick
        // everything" and silently unlink what is already there. A standard
        // category hides the section, so this exercises the absent-key path.
        $category  = Category::factory()->create(['type' => 'standard']);
        $recording = Recording::factory()->summarized()->create();

        app(RecordingAttachmentService::class)->attach($recording, Category::class, $category->id);

        Livewire::test(ManageCategories::class)
            ->callAction(TestAction::make('edit')->table($category), data: [
                'name'          => ['ar' => 'اسم جديد', 'en' => 'Renamed'],
                'type'          => 'standard',
                'display_order' => 3,
                'is_active'     => true,
            ])
            ->assertHasNoFormErrors();

        $this->assertSame('Renamed', $category->refresh()->getTranslation('name', 'en'));

        $this->assertSame(
            [$recording->id],
            $category->recordings()->pluck('recordings.id')->all(),
            'A save without the checkbox keys must leave the links untouched.',
        );
    }

    public function test_a_non_direct_category_that_already_holds_links_can_still_unlink_them(): void
    {
        // Defensive: nothing in the app should currently produce a non-direct
        // category holding links (Category::booted() blocks the type change,
        // and both link paths restrict to direct categories), but if one ever
        // exists the form must show those links so an admin can clear them,
        // rather than hiding data on a form that pretends it isn't there.
        $category  = Category::factory()->diseaseDirect()->create();
        $recording = Recording::factory()->summarized()->create();

        app(RecordingAttachmentService::class)->attach($recording, Category::class, $category->id);

        Livewire::test(ManageCategories::class)
            ->callAction(TestAction::make('edit')->table($category), data: [
                'name'          => $category->getTranslations('name'),
                'type'          => 'disease_direct',
                'display_order' => 0,
                'is_active'     => true,
                self::SUMMARIZED => [],
                self::DETAILED   => [],
            ])
            ->assertHasNoFormErrors();

        $this->assertSame([], $category->recordings()->pluck('recordings.id')->all());
        $this->assertDatabaseHas('recordings', ['id' => $recording->id, 'deleted_at' => null]);
    }

    public function test_a_category_holding_recordings_cannot_change_type_until_they_are_unlinked(): void
    {
        $category  = Category::factory()->create(['type' => 'direct']);
        $recording = Recording::factory()->summarized()->create();

        app(RecordingAttachmentService::class)->attach($recording, Category::class, $category->id);

        $this->expectException(BusinessRuleException::class);

        $category->type = 'standard';
        $category->save();
    }

    public function test_the_checkboxes_are_labelled_with_the_recording_text(): void
    {
        // Recordings have no title of their own, so the text is what an admin
        // recognises them by — it has to be the checkbox label.
        $summarized = Recording::factory()->summarized()->create([
            'description' => ['ar' => 'أعوذ بالله من الشيطان الرجيم', 'en' => 'I seek refuge in Allah'],
        ]);
        $detailed = Recording::factory()->detailed()->create([
            'description' => ['ar' => 'نص مطول', 'en' => 'A detailed text'],
        ]);

        $cards = collect(RecordingAttachmentsField::optionsFor(Recording::TYPE_SUMMARIZED))
            ->keyBy('id');

        $this->assertTrue($cards->has($summarized->id));
        $this->assertStringContainsString('أعوذ بالله من الشيطان الرجيم', $cards[$summarized->id]['excerpt']);
        $this->assertFalse(
            $cards->has($detailed->id),
            'The summarized list must not offer detailed recordings.',
        );
    }

    public function test_each_card_carries_the_details_needed_to_choose_between_recordings(): void
    {
        $category = Category::factory()->diseaseDirect()->create();
        $disease  = Disease::factory()->create(['category_id' => $category->id]);
        $recording = Recording::factory()->summarized()->create([
            'description'      => ['ar' => 'نص الرقية', 'en' => 'Ruqyah text'],
            'duration_seconds' => 135,
            'is_general'       => true,
        ]);

        app(RecordingAttachmentService::class)->attach($recording, Disease::class, $disease->id);

        $card = collect(RecordingAttachmentsField::optionsFor(Recording::TYPE_SUMMARIZED))
            ->firstWhere('id', $recording->id);

        $this->assertSame('2:15', $card['duration']);
        $this->assertSame('Linked to 1 item', $card['linked_label']);
        $this->assertTrue($card['is_general']);
        $this->assertTrue($card['has_audio']);
        $this->assertStringContainsString("/admin/recordings/{$recording->id}/audio", $card['audio_url']);
        // Searchable in either locale, whichever the admin types.
        $this->assertStringContainsString('ruqyah text', $card['search']);
        $this->assertStringContainsString('نص الرقية', $card['search']);
    }

    public function test_a_recording_without_audio_offers_no_preview(): void
    {
        $recording = Recording::factory()->summarized()->create(['audio_path' => null]);

        $card = collect(RecordingAttachmentsField::optionsFor(Recording::TYPE_SUMMARIZED))
            ->firstWhere('id', $recording->id);

        $this->assertFalse($card['has_audio']);
        $this->assertNull($card['audio_url']);
    }

    public function test_a_multi_line_recording_text_is_flattened_into_one_label_line(): void
    {
        $recording = Recording::factory()->summarized()->create([
            'description' => ['ar' => "السطر الأول\n\nالسطر الثاني", 'en' => 'Line one'],
        ]);

        $card = collect(RecordingAttachmentsField::optionsFor(Recording::TYPE_SUMMARIZED))
            ->firstWhere('id', $recording->id);

        $this->assertStringNotContainsString("\n", $card['excerpt']);
        $this->assertStringContainsString('السطر الأول السطر الثاني', $card['excerpt']);
    }
}
