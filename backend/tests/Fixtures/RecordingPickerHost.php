<?php

namespace Tests\Fixtures;

use App\Filament\Support\RecordingAttachmentsField;
use Filament\Schemas\Contracts\HasSchemas;
use Filament\Schemas\Concerns\InteractsWithSchemas;
use Filament\Schemas\Schema;
use Illuminate\Contracts\View\View;
use Livewire\Component;

/**
 * Hosts the recording picker in a bare Livewire component so tests can render
 * it for real.
 *
 * The manage pages keep their forms inside a modal, whose body Livewire does
 * not render in the test payload — so driving those actions never executes the
 * field's Blade view, and a template error there would only surface in a
 * browser. This renders it directly.
 */
class RecordingPickerHost extends Component implements HasSchemas
{
    use InteractsWithSchemas;

    public array $data = [];

    public function mount(): void
    {
        $this->pickerForm->fill();
    }

    public function pickerForm(Schema $schema): Schema
    {
        return $schema
            ->components(RecordingAttachmentsField::make())
            ->statePath('data');
    }

    public function render(): View
    {
        return view()->file(__DIR__ . '/recording-picker-host.blade.php');
    }
}
