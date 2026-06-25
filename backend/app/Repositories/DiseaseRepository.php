<?php

namespace App\Repositories;

use App\Models\Disease;
use App\Repositories\Contracts\DiseaseRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DiseaseRepository implements DiseaseRepositoryInterface
{
    public function paginate(int $perPage): LengthAwarePaginator
    {
        return Disease::active()
            ->ordered()
            ->with('subcategory')
            ->withCount('recordings')
            ->paginate($perPage);
    }

    public function findBySlug(string $slug): ?Disease
    {
        return Disease::active()
            ->where('slug', $slug)
            ->with([
                'subcategory.category',
                'aliases',
                'recordings' => fn ($q) => $q->orderBy('session_number'),
            ])
            ->first();
    }

    public function search(string $term): Collection
    {
        if (config('scalability.search.use_fulltext', false)
            && in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            try {
                return $this->fulltextSearch($term);
            } catch (\Throwable $e) {
                // Index missing or query unsupported — fall back to LIKE so search never breaks.
                Log::warning('Disease FULLTEXT search failed, falling back to LIKE: ' . $e->getMessage());
            }
        }

        return $this->likeSearch($term);
    }

    private function likeSearch(string $term): Collection
    {
        return Disease::active()
            ->where(function (Builder $query) use ($term) {
                $query->where('name->ar', 'like', "%{$term}%")
                    ->orWhere('name->en', 'like', "%{$term}%")
                    ->orWhereHas('aliases', function (Builder $alias) use ($term) {
                        $alias->where('alias->ar', 'like', "%{$term}%")
                            ->orWhere('alias->en', 'like', "%{$term}%");
                    });
            })
            ->ordered()
            ->with('subcategory')
            ->limit(50)
            ->get();
    }

    private function fulltextSearch(string $term): Collection
    {
        $boolean = $this->toBooleanFulltext($term);

        return Disease::active()
            ->whereRaw('MATCH(name_ar, name_en) AGAINST(? IN BOOLEAN MODE)', [$boolean])
            ->ordered()
            ->with('subcategory')
            ->limit(50)
            ->get();
    }

    private function toBooleanFulltext(string $term): string
    {
        $cleaned = preg_replace('/[+\-><()~*"@]+/u', ' ', $term) ?? $term;

        $words = array_filter(preg_split('/\s+/u', trim($cleaned)) ?: []);

        return implode(' ', array_map(static fn (string $w): string => $w . '*', $words));
    }
}
