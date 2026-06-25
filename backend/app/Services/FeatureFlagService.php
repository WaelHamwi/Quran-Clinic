<?php

namespace App\Services;

use App\Repositories\Contracts\FeatureFlagRepositoryInterface;
use Illuminate\Support\Facades\Cache;

class FeatureFlagService
{
    public const CACHE_KEY = 'features.v1.all';

    public function __construct(private FeatureFlagRepositoryInterface $repository) {}

    public function all(): array
    {
        return Cache::remember(self::CACHE_KEY, 300, fn () => $this->repository->all());
    }
}
