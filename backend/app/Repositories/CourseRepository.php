<?php

namespace App\Repositories;

use App\Models\Course;
use App\Repositories\Contracts\CourseRepositoryInterface;
use Illuminate\Support\Collection;

class CourseRepository implements CourseRepositoryInterface
{
    public function getAll(): Collection
    {
        return Course::active()->ordered()->get();
    }
}
