<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RecordingResource;
use App\Services\RecordingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecordingController extends Controller
{
    public function __construct(private RecordingService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $diseaseId = (int) $request->get('disease_id');

            if ($diseaseId <= 0) {
                return $this->error('A disease_id query parameter is required', 422);
            }

            return $this->success(RecordingResource::collection($this->service->getByDisease($diseaseId)));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function stream(Request $request, int $id): JsonResponse
    {
        try {
            $recording = $this->service->find($id);

            if (! $recording) {
                return $this->error('Recording not found', 404);
            }

            if (! $this->service->canAccess($recording, $request->user())) {
                return $this->error('This session requires an active subscription or trial.', 403);
            }

            return $this->success([
                'id'        => $recording->id,
                'audio_url' => $recording->streamUrl(),
            ]);
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function general(): JsonResponse
    {
        try {
            return $this->success(RecordingResource::collection($this->service->generalRuqyah()));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function play(int $id): JsonResponse
    {
        try {
            $recording = $this->service->find($id);

            if (! $recording) {
                return $this->error('Recording not found', 404);
            }

            $this->service->recordPlay($recording);

            return $this->success(['plays_count' => $recording->plays_count + 1]);
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
