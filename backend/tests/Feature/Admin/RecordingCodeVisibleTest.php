<?php

namespace Tests\Feature\Admin;

use App\Filament\Resources\Recordings\Pages\ManageRecordings;
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
 * The code is the handle a recording is identified by — recordings have no
 * title, only a body of Arabic text. It has to be readable in the two places
 * an admin works from the source sheet: the Recordings table, and the picker
 * on the Category / Subcategory / Disease forms.
 */
class RecordingCodeVisibleTest extends TestCase
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

    public function test_the_recordings_table_has_a_code_column_showing_each_code(): void
    {
        Recording::factory()->create(['code' => 'ORG-01-S']);
        Recording::factory()->create(['code' => 'ORG-02-D']);

        Livewire::test(ManageRecordings::class)
            ->assertTableColumnExists('code')
            ->assertSee('ORG-01-S')
            ->assertSee('ORG-02-D');
    }

    public function test_the_code_column_can_be_searched_and_sorted(): void
    {
        $wanted = Recording::factory()->create(['code' => 'ORG-01-S']);
        $other  = Recording::factory()->create(['code' => 'HEART-09-D']);

        Livewire::test(ManageRecordings::class)
            ->searchTable('ORG-01')
            ->assertCanSeeTableRecords([$wanted])
            ->assertCanNotSeeTableRecords([$other]);
    }

    public function test_an_uncoded_recording_shows_a_placeholder_not_an_invented_code(): void
    {
        $recording = Recording::factory()->create(['code' => null]);

        $this->assertNull($recording->fresh()->code);

        Livewire::test(ManageRecordings::class)
            ->assertCanSeeTableRecords([$recording])
            ->assertSee('— no code —');
    }

    public function test_the_picker_on_the_owner_forms_shows_each_recording_code(): void
    {
        Recording::factory()->summarized()->create(['code' => 'ORG-01-S']);

        $html = Livewire::test(RecordingPickerHost::class)->html();

        $this->assertStringContainsString('ORG-01-S', $html);
        // Typing the code has to find the card, so it belongs in the haystack.
        $this->assertStringContainsString('org-01-s', $html);
        $this->assertStringContainsString(RecordingAttachmentsField::SUMMARIZED_KEY, $html);
    }
}
