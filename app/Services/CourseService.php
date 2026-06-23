<?php

namespace App\Services;

use App\Models\Course;
use App\Repositories\Contracts\CourseRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class CourseService
{
    public function __construct(private CourseRepositoryInterface $repository) {}

    public function getAll(): Collection
    {
        // Cache plain attribute arrays — NOT Eloquent models. The database cache
        // store cannot round-trip serialized model objects (reads back as
        // __PHP_Incomplete_Class), so we cache raw attributes and rehydrate.
        $rows = Cache::remember(
            'courses.v1.all',
            300,
            fn () => $this->repository->getAll()->map->getAttributes()->all(),
        );

        return Course::hydrate($rows);
    }
}
