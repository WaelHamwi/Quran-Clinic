<?php

namespace Tests\Feature\Admin;

use App\Filament\Support\RecordingAttachmentsField;
use App\Models\Recording;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\Fixtures\RecordingPickerHost;
use Tests\TestCase;

/**
 * Renders the picker for real — the manage pages keep their forms in a modal
 * whose body never reaches the test payload, so driving those actions proves
 * nothing about this Blade view.
 */
class RecordingPickerRenderTest extends TestCase
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

    public function test_it_renders_a_card_per_recording_showing_its_code_text_and_details(): void
    {
        $recording = Recording::factory()->summarized()->create([
            'code'             => 'ORG-01-S',
            'description'      => ['ar' => 'أعوذ بالله من الشيطان الرجيم', 'en' => 'Refuge'],
            'duration_seconds' => 135,
        ]);

        $html = Livewire::test(RecordingPickerHost::class)->html();

        $this->assertStringContainsString('أعوذ بالله من الشيطان الرجيم', $html);
        $this->assertStringContainsString('2:15', $html);
        $this->assertStringContainsString('Not linked yet', $html);
        // The code is the handle an admin matches the card against, so it has
        // to be on the card — and searchable by typing it.
        $this->assertStringContainsString($recording->code, $html);
        $this->assertStringContainsString('org-01-s', $html);
    }

    public function test_cards_read_in_sheet_code_order_with_uncoded_ones_last(): void
    {
        // Created out of order on purpose: ordering by id would put C300 first
        // and strand the uncoded one in the middle, which is what linking a
        // recording by its code was tripping over.
        Recording::factory()->summarized()->create(['code' => 'C300']);
        Recording::factory()->summarized()->create(['code' => null]);
        Recording::factory()->summarized()->create(['code' => 'C001']);
        Recording::factory()->summarized()->create(['code' => 'B001']);

        $html = Livewire::test(RecordingPickerHost::class)->html();

        $positions = [];
        foreach (['B001', 'C001', 'C300'] as $code) {
            $positions[$code] = strpos($html, '>' . $code . '<');
            $this->assertNotFalse($positions[$code], "code {$code} is missing from the picker");
        }

        $this->assertLessThan($positions['C001'], $positions['B001']);
        $this->assertLessThan($positions['C300'], $positions['C001']);
    }

    public function test_a_recording_without_a_code_is_still_pickable(): void
    {
        // Not every recording has a sheet code yet, and none is invented to
        // stand in — so the picker still has to offer it, identified by its
        // text rather than by a code it does not have.
        $recording = Recording::factory()->summarized()->create(['code' => null]);

        $html = Livewire::test(RecordingPickerHost::class)->html();

        $this->assertNull($recording->fresh()->code);
        $this->assertStringContainsString((string) $recording->id, $html);
        $this->assertStringNotContainsString(sprintf('R-%04d', $recording->id), $html);
    }

    public function test_every_recording_is_in_the_dom_so_a_chosen_one_survives_collapsing(): void
    {
        // "Show more" hides with x-show rather than dropping nodes, so a card
        // deep in the list can still be added to the sequence without hunting
        // for it first.
        $recordings = Recording::factory()->summarized()->count(12)->create();

        $html = Livewire::test(RecordingPickerHost::class)->html();

        foreach ($recordings as $recording) {
            $this->assertStringContainsString("isVisible('{$recording->id}')", $html);
            $this->assertStringContainsString("add('{$recording->id}')", $html);
        }
    }

    public function test_the_sequence_binds_to_the_field_state_path(): void
    {
        Recording::factory()->summarized()->create();

        $html = Livewire::test(RecordingPickerHost::class)->html();

        // Entangled rather than wire:model'd on each card: the state is an
        // ordered list that may hold the same id several times, which no set of
        // checkbox bindings can express.
        $this->assertStringContainsString(
            "\$wire.\$entangle('data." . RecordingAttachmentsField::SUMMARIZED_KEY . "')",
            $html,
        );
    }

    public function test_a_recording_can_be_added_to_the_sequence_more_than_once(): void
    {
        $first  = Recording::factory()->summarized()->create();
        $second = Recording::factory()->summarized()->create();

        // Beginning, middle, end: the same recording at positions 1 and 3.
        $component = Livewire::test(RecordingPickerHost::class)->set(
            'data.' . RecordingAttachmentsField::SUMMARIZED_KEY,
            [(string) $first->id, (string) $second->id, (string) $first->id],
        );

        $component->assertSet('data.' . RecordingAttachmentsField::SUMMARIZED_KEY, [
            (string) $first->id,
            (string) $second->id,
            (string) $first->id,
        ]);

        $this->assertStringContainsString(
            'data-sequence="' . $first->id . ',' . $second->id . ',' . $first->id . '"',
            $component->html(),
            'The repeat must survive the round trip instead of being collapsed to one entry.',
        );
    }

    public function test_the_alpine_block_survives_html_parsing_intact(): void
    {
        // A bare double quote anywhere in the x-data expression closes the
        // attribute early: Alpine then never initialises, the whole component
        // leaks onto the page as text, and nothing collapses or plays. Parsing
        // the markup is the only way to catch that from a test.
        Recording::factory()->summarized()->count(3)->create();

        $html = Livewire::test(RecordingPickerHost::class)->html();
        $xData = $this->firstXDataAttribute($html);

        $this->assertNotNull($xData, 'The picker should render an x-data block.');

        // Every method has to still be inside the attribute after parsing.
        foreach (['sequence', 'cardOf', 'countOf', 'add', 'removeAt', 'moveBy', 'matching', 'visibleIds', 'hiddenCount', 'isVisible', 'showMore', 'showAll', 'collapse', 'toggleAudio'] as $member) {
            $this->assertStringContainsString(
                $member,
                $xData,
                "`{$member}` fell outside the x-data attribute — it was cut short by an unescaped quote.",
            );
        }

        $this->assertStringEndsWith('}', trim($xData));
    }

    private function firstXDataAttribute(string $html): ?string
    {
        $document = new \DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="UTF-8">' . $html);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        foreach ((new \DOMXPath($document))->query('//*[@x-data]') as $node) {
            $value = $node->getAttribute('x-data');

            if (str_contains($value, 'playingId')) {
                return $value;
            }
        }

        return null;
    }

    public function test_an_already_linked_recording_renders_in_the_sequence(): void
    {
        $linked   = Recording::factory()->summarized()->create();
        $unlinked = Recording::factory()->summarized()->create();

        $html = Livewire::test(RecordingPickerHost::class)
            ->set('data.' . RecordingAttachmentsField::SUMMARIZED_KEY, [$linked->id])
            ->html();

        $this->assertSame([(string) $linked->id], $this->renderedSequence($html));
        $this->assertNotContains((string) $unlinked->id, $this->renderedSequence($html));
    }

    /**
     * The sequence the component rendered with, read back off the DOM — the
     * rows themselves are drawn by Alpine from the entangled state, which no
     * server-side render can show.
     *
     * @return list<string>
     */
    private function renderedSequence(string $html): array
    {
        if (! preg_match('/data-sequence="([^"]*)"/', $html, $match)) {
            return [];
        }

        return $match[1] === '' ? [] : explode(',', $match[1]);
    }

    public function test_a_recording_with_audio_gets_a_preview_button_and_one_without_does_not(): void
    {
        $withAudio = Recording::factory()->summarized()->create();
        $noAudio   = Recording::factory()->summarized()->create(['audio_path' => null]);

        // @js() JSON-encodes the URL, which escapes the slashes.
        $html = str_replace('\\/', '/', Livewire::test(RecordingPickerHost::class)->html());

        $this->assertStringContainsString("/admin/recordings/{$withAudio->id}/audio", $html);
        $this->assertStringNotContainsString("/admin/recordings/{$noAudio->id}/audio", $html);
        $this->assertStringContainsString('no audio', $html);
    }

    public function test_the_list_starts_collapsed_and_offers_show_more(): void
    {
        Recording::factory()->summarized()->count(9)->create();

        $html = Livewire::test(RecordingPickerHost::class)->html();

        $this->assertStringContainsString('Show more', $html);
        $this->assertStringContainsString('Show all', $html);
        $this->assertMatchesRegularExpression('/limit:\s*5\b/', $html, 'The list should open showing only the first few.');
    }

    public function test_it_renders_an_empty_message_rather_than_a_bare_list(): void
    {
        $html = Livewire::test(RecordingPickerHost::class)->html();

        $this->assertStringContainsString('recording exists yet', $html);
        // Each card carries a wire:key off the state path; the stylesheet and
        // the Alpine block do not.
        $this->assertStringNotContainsString(
            'wire:key="data.' . RecordingAttachmentsField::SUMMARIZED_KEY . '.',
            $html,
        );
    }
}
