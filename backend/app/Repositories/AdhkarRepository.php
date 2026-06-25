<?php

namespace App\Repositories;

use App\Models\AdhkarCategory;
use App\Repositories\Contracts\AdhkarRepositoryInterface;
use Illuminate\Support\Collection;

class AdhkarRepository implements AdhkarRepositoryInterface
{
    public function categories(): Collection
    {
        return AdhkarCategory::active()->ordered()->withCount('items')->get();
    }

    public function findCategoryBySlug(string $slug): ?AdhkarCategory
    {
        return AdhkarCategory::active()
            ->where('slug', $slug)
            ->with($this->contentEagerLoads())
            ->first();
    }

    public function itemsByCategorySlug(string $slug): Collection
    {
        $category = AdhkarCategory::active()->where('slug', $slug)->first();

        if (! $category) {
            return new Collection();
        }

        return $category->items()->ordered()->get();
    }

    public function todayCategories(): Collection
    {
        return AdhkarCategory::active()
            ->ordered()
            ->with($this->contentEagerLoads())
            ->get();
    }

    public function wakingItems(): Collection
    {
        $category = AdhkarCategory::active()->where('slug', 'waking')->first();

        if (! $category) {
            return new Collection();
        }

        return $category->items()->ordered()->get();
    }

    /**
     * Eager-load a category's sections (with their items) and any
     * items that are not assigned to a section, all in manual order.
     */
    private function contentEagerLoads(): array
    {
        return [
            'sections' => fn ($q) => $q->ordered()->with(['items' => fn ($q) => $q->ordered()]),
            'items'    => fn ($q) => $q->whereNull('adhkar_section_id')->ordered(),
        ];
    }
}
