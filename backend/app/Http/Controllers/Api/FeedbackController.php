<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FeedbackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FeedbackController extends Controller
{
    public function __construct(private FeedbackService $service) {}

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'service_type'   => 'required|string|max:50',
                'service_id'     => 'nullable|integer',
                'was_beneficial' => 'nullable|boolean',
                'likes'          => 'nullable|string|max:2000',
                'dislikes'       => 'nullable|string|max:2000',
                'comment'        => 'nullable|string|max:2000',
            ]);

            $feedback = $this->service->submit($request->user()->id, $data);

            return $this->success(['id' => $feedback->id], 'Feedback submitted', 201);
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
