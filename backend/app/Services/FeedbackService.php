<?php

namespace App\Services;

use App\Models\Feedback;
use App\Repositories\Contracts\FeedbackRepositoryInterface;
use Illuminate\Support\Facades\DB;

class FeedbackService
{
    public function __construct(private FeedbackRepositoryInterface $repository) {}

    public function submit(int $userId, array $data): Feedback
    {
        return DB::transaction(fn () => $this->repository->store(array_merge($data, ['user_id' => $userId])));
    }
}
