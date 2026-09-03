<?php

namespace App\Services;

use App\Models\Surah;
use App\Repositories\Contracts\SurahRepositoryInterface;
use App\Support\ModelCache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;

class SurahService
{
    /** The full surah list (small, immutable Quran data) cached under one key. */
    public const CACHE_ALL = 'surahs.v1.all';

    /** Keys invalidated when a Surah is written. */
    public const CACHE_KEYS = [self::CACHE_ALL];

    public function __construct(private SurahRepositoryInterface $repository) {}

    public function getAllSurahs(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $surahs = ModelCache::rememberMany(self::CACHE_ALL, 300, fn () => $this->repository->all());

        return $this->paginate($surahs, $perPage, $page);
    }

    /**
     * One surah with its verses — uncached. Verses are a large table read one
     * surah at a time; an indexed `where surah_id` query is the right tool, and
     * caching the whole set to serve one slice is a net loss. This endpoint is
     * also cold (the mobile Mushaf reads verses from its own local SQLite).
     */
    public function getSurahWithVerses(int $id): ?Surah
    {
        return $this->repository->getSurahWithVerses($id);
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
