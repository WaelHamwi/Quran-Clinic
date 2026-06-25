<?php

namespace App\Repositories\Contracts;

use App\Models\Report;

interface ReportRepositoryInterface
{
    public function store(array $data): Report;
}
