<?php

namespace App\Services;

use App\Repositories\Contracts\CourseRepositoryInterface;
use App\Support\ModelCache;
use Illuminate\Support\Collection;

class CourseService
{
    public const CACHE_KEY = 'courses.v1.all';

    /** Keys invalidated when a Course is written. */
    public const CACHE_KEYS = [self::CACHE_KEY];

    public function __construct(private CourseRepositoryInterface $repository) {}

    public function getAll(): Collection
    {
        return ModelCache::rememberMany(self::CACHE_KEY, 300, fn () => $this->repository->getAll());
    }
}
