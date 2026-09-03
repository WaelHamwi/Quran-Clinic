<?php

namespace App\Services;

use App\Models\SponsorScreenConfig;
use App\Repositories\Contracts\SponsorRepositoryInterface;
use App\Support\ModelCache;
use Illuminate\Support\Collection;

class SponsorService
{
    public const CACHE_ALL = 'sponsors.v1.all';

    public const CACHE_SCREEN = 'sponsors.v1.screen';

    /** Keys invalidated when a Sponsor or the screen config is written. */
    public const CACHE_KEYS = [self::CACHE_ALL, self::CACHE_SCREEN];

    private const CACHE_TTL = 300;

    public function __construct(private SponsorRepositoryInterface $repository) {}

    public function getAll(): Collection
    {
        return ModelCache::rememberMany(self::CACHE_ALL, self::CACHE_TTL, fn () => $this->repository->getAll());
    }

    public function screenConfig(): SponsorScreenConfig
    {
        /** @var SponsorScreenConfig $config */
        $config = ModelCache::remember(self::CACHE_SCREEN, self::CACHE_TTL, fn () => $this->repository->screenConfig());

        return $config;
    }
}
