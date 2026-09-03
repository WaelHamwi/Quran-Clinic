<?php

namespace Tests\Fixtures;

use App\Filament\Resources\Categories\Schemas\CategoryForm;
use Filament\Schemas\Contracts\HasSchemas;
use Filament\Schemas\Concerns\InteractsWithSchemas;
use Filament\Schemas\Schema;
use Illuminate\Contracts\View\View;
use Livewire\Component;

/**
 * Hosts the real category form so tests can flip Type and see what an admin
 * would. The manage pages keep their forms in a modal whose body Livewire does
 * not render in the test payload.
 */
class CategoryFormHost extends Component implements HasSchemas
{
    use InteractsWithSchemas;

    public array $data = [];

    public function mount(): void
    {
        $this->categoryForm->fill();
    }

    public function categoryForm(Schema $schema): Schema
    {
        return $schema
            ->components(CategoryForm::getSchema())
            ->statePath('data');
    }

    public function render(): View
    {
        return view()->file(__DIR__ . '/category-form-host.blade.php');
    }
}
