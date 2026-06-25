<?php

namespace App\Repositories;

use App\Models\TahsinatCategory;
use App\Repositories\Contracts\TahsinatRepositoryInterface;
use Illuminate\Support\Collection;

class TahsinatRepository implements TahsinatRepositoryInterface
{
    public function categories(): Collection
    {
        return TahsinatCategory::active()->ordered()->withCount('items')->get();
    }

    public function findCategoryBySlug(string $slug): ?TahsinatCategory
    {
        return TahsinatCategory::active()
            ->where('slug', $slug)
            ->with($this->contentEagerLoads())
            ->first();
    }

    public function itemsByCategorySlug(string $slug): Collection
    {
        $category = TahsinatCategory::active()->where('slug', $slug)->first();

        if (! $category) {
            return new Collection();
        }

        return $category->items()->ordered()->get();
    }

    /**
     * Eager-load a category's sections (with their items) and any items that
     * are not assigned to a section, all in manual order. Randomization of
     * `order_randomly` sections is applied client-side, per view.
     */
    private function contentEagerLoads(): array
    {
        return [
            'sections' => fn ($q) => $q->ordered()->with(['items' => fn ($q) => $q->ordered()]),
            'items'    => fn ($q) => $q->whereNull('tahsinat_section_id')->ordered(),
        ];
    }
}
