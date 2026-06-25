<?php

namespace App\Services;

use App\Models\Surah;
use App\Repositories\Contracts\SurahRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class SurahService
{
    public function __construct(private SurahRepositoryInterface $repository) {}

    public function getAllSurahs(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $key = "surahs.v2.list.{$page}.{$perPage}";
        $cached = Cache::get($key);

        // Accept only a properly deserialized paginator; evict anything else silently.
        if ($cached instanceof LengthAwarePaginator) {
            return $cached;
        }

        Cache::forget($key);
        $result = $this->repository->getAllSurahs($perPage, $page);
        Cache::put($key, $result, 3600);
        return $result;
    }

    public function getSurahWithVerses(int $id): ?Surah
    {
        $key = "surahs.v2.{$id}.verses";
        $cached = Cache::get($key);

        // Accept only a properly deserialized Surah model; evict __PHP_Incomplete_Class etc.
        if ($cached instanceof Surah) {
            return $cached;
        }

        Cache::forget($key);
        $result = $this->repository->getSurahWithVerses($id);
        if ($result !== null) {
            Cache::put($key, $result, 300);
        }
        return $result;
    }
}
