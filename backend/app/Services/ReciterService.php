<?php

namespace App\Services;

use App\Repositories\Contracts\ReciterRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class ReciterService
{
    public function __construct(private ReciterRepositoryInterface $repository) {}

    public function getAllActive(int $perPage = 15): LengthAwarePaginator
    {
        $key = "reciters.v2.active.{$perPage}";
        $cached = Cache::get($key);

        if ($cached instanceof LengthAwarePaginator) {
            return $cached;
        }

        Cache::forget($key);
        $result = $this->repository->getAllActive($perPage);
        Cache::put($key, $result, 3600);
        return $result;
    }

    public function getReciterWithRecitations(int $id): mixed
    {
        $key = "reciters.v2.{$id}.recitations";

        try {
            return Cache::remember($key, 3600, fn() => $this->repository->findById($id));
        } catch (\Throwable $e) {
            \Log::warning('ReciterService cache failed, falling back to DB: ' . $e->getMessage());
            Cache::forget($key);
            return $this->repository->findById($id);
        }
    }
}
