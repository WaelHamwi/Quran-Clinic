<?php

namespace App\Services;

use App\Models\Disease;
use App\Models\SearchLog;
use App\Repositories\Contracts\DiseaseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class DiseaseService
{
    /**
     * A disease write invalidates the category navigation tree (owned by
     * CategoryService) — that cached payload embeds subcategory disease counts
     * and the direct-disease list. Re-exported for a single source of truth.
     */
    public const CACHE_KEYS = CategoryService::CACHE_KEYS;

    public function __construct(private DiseaseRepositoryInterface $repository) {}

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage);
    }

    public function getBySlug(string $slug): ?Disease
    {
        return $this->repository->findBySlug($slug);
    }

    public function search(string $term): Collection
    {
        $results = $this->repository->search($term);

        // Fire-and-forget: a logging failure must never break the search response itself.
        try {
            SearchLog::create([
                'user_id'       => Auth::guard('sanctum')->id(),
                'term'          => $term,
                'results_count' => $results->count(),
                'created_at'    => now(),
            ]);
        } catch (\Throwable $e) {
            logger()->error('SearchLog write failed: ' . $e->getMessage());
        }

        return $results;
    }
}
