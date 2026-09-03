<?php

namespace Tests\Fixtures;

use App\Filament\Resources\Subcategories\Schemas\SubcategoryForm;
use Filament\Schemas\Contracts\HasSchemas;
use Filament\Schemas\Concerns\InteractsWithSchemas;
use Filament\Schemas\Schema;
use Illuminate\Contracts\View\View;
use Livewire\Component;

/** @see CategoryFormHost — same reason, for the subcategory form. */
class SubcategoryFormHost extends Component implements HasSchemas
{
    use InteractsWithSchemas;

    public array $data = [];

    public function mount(): void
    {
        $this->subcategoryForm->fill();
    }

    public function subcategoryForm(Schema $schema): Schema
    {
        return $schema
            ->components(SubcategoryForm::getSchema())
            ->statePath('data');
    }

    public function render(): View
    {
        return view()->file(__DIR__ . '/subcategory-form-host.blade.php');
    }
}
