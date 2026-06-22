<?php

namespace App\Services;

use App\Models\Report;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReportService
{
    public function __construct(private ReportRepositoryInterface $repository) {}

    public function submit(?int $userId, array $data, ?UploadedFile $image = null): Report
    {
        $payload = [
            'user_id' => $userId,
            'type'    => $data['type'],
            'message' => $data['message'],
            'status'  => 'new',
        ];

        if ($image !== null) {
            $payload['image_path'] = $image->store('reports', 'public');
        }

        return DB::transaction(fn () => $this->repository->store($payload));
    }
}
