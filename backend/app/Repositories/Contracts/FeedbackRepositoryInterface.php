<?php

namespace App\Repositories\Contracts;

use App\Models\Feedback;

interface FeedbackRepositoryInterface
{
    public function store(array $data): Feedback;
}
