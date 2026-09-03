<?php

namespace App\Services;

use App\Models\Reciter;
use App\Repositories\Contracts\ReciterRepositoryInterface;
use App\Support\ModelCache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;

class ReciterService
{
    /** The full active-reciter list cached under one key. */
    public const CACHE_ALL = 'reciters.v1.all';

    /** Keys invalidated when a Reciter is written. */
    public const CACHE_KEYS = [self::CACHE_ALL];

    public function __construct(private ReciterRepositoryInterface $repository) {}

    public function getAllActive(int $perPage = 15): LengthAwarePaginator
    {
        $reciters = ModelCache::rememberMany(self::CACHE_ALL, 300, fn () => $this->repository->allActive());

        return $this->paginate($reciters, $perPage, Paginator::resolveCurrentPage());
    }

    /**
     * One reciter with its recitations — a per-parent detail lookup, kept uncached
     * like AdhkarService::itemsByCategorySlug, so the static CACHE_KEYS convention
     * the models rely on stays intact.
     */
    public function getReciterWithRecitations(int $id): ?Reciter
    {
        return $this->repository->findById($id);
    }

    private function paginate(Collection $items, int $perPage, int $page): LengthAwarePaginator
    {
        return new LengthAwarePaginator(
            $items->forPage($page, $perPage)->values(),
            $items->count(),
            $perPage,
            $page,
            ['path' => Paginator::resolveCurrentPath()],
        );
    }
}
