<?php

namespace App\Repositories;

use App\Models\Feedback;
use App\Repositories\Contracts\FeedbackRepositoryInterface;

class FeedbackRepository implements FeedbackRepositoryInterface
{
    public function store(array $data): Feedback
    {
        return Feedback::create($data);
    }
}
