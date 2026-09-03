<?php

namespace Tests\Feature\Admin;

use App\Filament\Resources\Recordings\Pages\ManageRecordings;
use App\Models\Category;
use App\Models\Disease;
use App\Models\Recording;
use App\Models\User;
use App\Services\RecordingAttachmentService;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * The Recordings table is drag-orderable. This pins the two things that make
 * that safe: the drag writes the library order, and the library order is NOT
 * the playback order — what plays is each item's own session sequence.
 */
class RecordingDisplayOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin);
    }

    public function test_drag_ordering_is_offered_in_the_custom_order_and_only_there(): void
    {
        Recording::factory()->summarized()->count(3)->create();

        $component = Livewire::test(ManageRecordings::class);

        $this->assertSame('display_order', $component->instance()->getTable()->getReorderColumn());

        // A drag writes positions for the rows in the sequence they were
        // dropped. Offer it while the list reads alphabetically or by date and
        // the row would spring straight back to where that sort puts it.
        foreach ([null, 'code', 'latest', 'oldest'] as $order) {
            $this->assertFalse(
                $component->filterTable('order', $order)->instance()->getTable()->isReorderable(),
                sprintf('Dragging should not be offered while the list is read in the "%s" order.', $order ?? 'default'),
            );
        }

        $this->assertTrue(
            $component->filterTable('order', 'custom')->instance()->getTable()->isReorderable(),
            'The custom order is the one a drag edits, so that is where the handles belong.',
        );
    }

    public function test_the_table_does_not_impose_an_order_of_its_own(): void
    {
        $table = Livewire::test(ManageRecordings::class)->instance()->getTable();

        // Which order the list opens in is the admin's choice, made with the
        // "Order by" chooser — not something drag support gets to decide.
        $this->assertSame('created_at', $table->getDefaultSortColumn());
        $this->assertSame('desc', $table->getDefaultSortDirection());
    }

    public function test_turning_dragging_on_does_not_reshuffle_the_list(): void
    {
        $first  = Recording::factory()->summarized()->create();
        $second = Recording::factory()->summarized()->create();
        $third  = Recording::factory()->summarized()->create();

        $component = Livewire::test(ManageRecordings::class)
            ->filterTable('order', 'custom')
            ->call('reorderTable', [$third->getKey(), $first->getKey(), $second->getKey()]);

        $component->assertCanSeeTableRecords([$third, $first, $second], inOrder: true);

        // The rows you drag must be the rows you were already looking at: the
        // handles appearing is not an occasion for the list to move.
        $component->call('toggleTableReordering')
            ->assertCanSeeTableRecords([$third, $first, $second], inOrder: true);
    }

    public function test_arrange_manually_switches_to_the_custom_order_and_turns_on_dragging(): void
    {
        Recording::factory()->summarized()->count(2)->create();

        // Otherwise the handles are reachable only by knowing to pick "Custom
        // order" from the chooser first.
        $component = Livewire::test(ManageRecordings::class)
            ->assertSee('Arrange manually')
            ->callAction(TestAction::make('arrangeManually')->table());

        $this->assertSame('custom', $component->instance()->getTableFilterState('order')['value']);
        $this->assertTrue($component->instance()->isTableReordering());
    }

    public function test_the_list_still_arrives_newest_first_by_default(): void
    {
        $older = Recording::factory()->summarized()->create(['created_at' => now()->subDays(3)]);
        $newer = Recording::factory()->summarized()->create(['created_at' => now()]);

        // Even with a custom order saved, an untouched table reads as it always
        // did — the arrangement is offered, never forced.
        $older->update(['display_order' => 1]);
        $newer->update(['display_order' => 2]);

        Livewire::test(ManageRecordings::class)
            ->assertCanSeeTableRecords([$newer, $older], inOrder: true);
    }

    public function test_dragging_a_recording_rewrites_the_library_order(): void
    {
        $first  = Recording::factory()->summarized()->create();
        $second = Recording::factory()->summarized()->create();
        $third  = Recording::factory()->summarized()->create();

        Livewire::test(ManageRecordings::class)
            ->filterTable('order', 'custom')
            ->call('reorderTable', [$third->getKey(), $first->getKey(), $second->getKey()]);

        $this->assertSame(
            [$third->id, $first->id, $second->id],
            Recording::ordered()->pluck('id')->all(),
        );
    }

    public function test_dragging_on_a_later_page_leaves_the_earlier_pages_alone(): void
    {
        // Filament numbers a drag 1..N over the rows it was handed, which with
        // pagination on is one page's worth — page two stamping 1, 2, 3 over
        // positions page one holds would interleave the two.
        $recordings = Recording::factory()->summarized()->count(6)->create();
        [$one, $two, $three, $four, $five, $six] = $recordings->all();

        Livewire::test(ManageRecordings::class)
            ->filterTable('order', 'custom')
            ->set('tableRecordsPerPage', 3)
            ->set('paginators.page', 2)
            ->call('reorderTable', [$six->getKey(), $four->getKey(), $five->getKey()]);

        $this->assertSame(
            [$one->id, $two->id, $three->id, $six->id, $four->id, $five->id],
            Recording::ordered()->pluck('id')->all(),
        );
        $this->assertSame(
            [1, 2, 3],
            Recording::whereIn('id', [$one->id, $two->id, $three->id])
                ->orderBy('display_order')
                ->pluck('display_order')
                ->all(),
            'The first page should still hold the positions it held.',
        );
    }

    public function test_a_new_recording_joins_the_end_of_the_library(): void
    {
        // Every new row taking the column default of 0 would pile them all at
        // the front in one block; appending keeps the order an admin arranged.
        $existing = Recording::factory()->summarized()->create();
        $existing->update(['display_order' => 7]);

        $added = Recording::factory()->summarized()->create();

        $this->assertSame(8, $added->fresh()->display_order);
        $this->assertSame(
            [$existing->id, $added->id],
            Recording::ordered()->pluck('id')->all(),
        );
    }

    public function test_an_explicit_display_order_is_kept(): void
    {
        Recording::factory()->summarized()->create(['display_order' => 40]);
        $placed = Recording::factory()->summarized()->create(['display_order' => 5]);

        $this->assertSame(5, $placed->fresh()->display_order);
        $this->assertSame($placed->id, Recording::ordered()->first()->id);
    }

    public function test_the_order_by_filter_offers_custom_alphabetical_and_date_orders(): void
    {
        $filter = Livewire::test(ManageRecordings::class)->instance()->getTable()->getFilter('order');

        $this->assertNotNull($filter, 'The Recordings table should offer an "Order by" chooser.');
        $this->assertSame(
            ['custom', 'code', 'latest', 'oldest'],
            array_keys($filter->getOptions()),
        );
    }

    public function test_ordering_alphabetically_sorts_by_code_and_puts_uncoded_last(): void
    {
        $c = Recording::factory()->summarized()->create(['code' => 'C003']);
        $a = Recording::factory()->summarized()->create(['code' => 'C001']);
        $b = Recording::factory()->summarized()->create(['code' => 'C002']);
        $none = Recording::factory()->summarized()->create(['code' => null]);

        Livewire::test(ManageRecordings::class)
            ->filterTable('order', 'code')
            ->assertCanSeeTableRecords([$a, $b, $c, $none], inOrder: true);
    }

    public function test_ordering_by_date_reads_oldest_or_newest_first(): void
    {
        $old = Recording::factory()->summarized()->create(['created_at' => now()->subDays(5)]);
        $mid = Recording::factory()->summarized()->create(['created_at' => now()->subDays(3)]);
        $new = Recording::factory()->summarized()->create(['created_at' => now()]);

        Livewire::test(ManageRecordings::class)
            ->filterTable('order', 'oldest')
            ->assertCanSeeTableRecords([$old, $mid, $new], inOrder: true);

        Livewire::test(ManageRecordings::class)
            ->filterTable('order', 'latest')
            ->assertCanSeeTableRecords([$new, $mid, $old], inOrder: true);
    }

    public function test_the_custom_order_shows_what_was_dragged(): void
    {
        $first  = Recording::factory()->summarized()->create();
        $second = Recording::factory()->summarized()->create();
        $third  = Recording::factory()->summarized()->create();

        Livewire::test(ManageRecordings::class)
            ->filterTable('order', 'custom')
            ->call('reorderTable', [$third->getKey(), $first->getKey(), $second->getKey()]);

        Livewire::test(ManageRecordings::class)
            ->filterTable('order', 'custom')
            ->assertCanSeeTableRecords([$third, $first, $second], inOrder: true);
    }

    public function test_reordering_the_library_does_not_change_what_an_item_plays(): void
    {
        // The two orders are separate on purpose: display_order arranges the
        // Recordings list, session_number is the sequence a disease plays. A
        // drag in the CMS must never reshuffle a ruqyah.
        $category = Category::factory()->diseaseDirect()->create();
        $disease  = Disease::factory()->create(['category_id' => $category->id]);

        $a = Recording::factory()->summarized()->create();
        $b = Recording::factory()->summarized()->create();

        app(RecordingAttachmentService::class)->syncForAttachable($disease, [$a->id, $b->id, $a->id]);

        $before = $disease->recordings()->pluck('recordings.id')->all();

        Livewire::test(ManageRecordings::class)
            ->filterTable('order', 'custom')
            ->call('reorderTable', [$b->getKey(), $a->getKey()]);

        $this->assertSame([$b->id, $a->id], Recording::ordered()->pluck('id')->all());
        $this->assertSame(
            $before,
            $disease->recordings()->pluck('recordings.id')->all(),
            'The disease must still play its own sequence, untouched by the library order.',
        );
        $this->assertSame(
            [1, 2, 3],
            $disease->recordings()->get()->map(fn ($r) => $r->pivot->session_number)->all(),
        );
    }
}
