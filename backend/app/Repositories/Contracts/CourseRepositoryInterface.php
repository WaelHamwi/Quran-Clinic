<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface CourseRepositoryInterface
{
    public function getAll(): Collection;
}
