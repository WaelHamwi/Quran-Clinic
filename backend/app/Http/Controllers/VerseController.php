<?php

namespace App\Http\Controllers;

use App\Http\Resources\VerseResource;
use App\Services\VerseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerseController extends Controller
{
    public function __construct(private VerseService $service) {}

    public function search(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'q'        => 'required|string|min:2|max:200',
                'per_page' => 'integer|min:1|max:100',
            ]);

            $perPage = (int) ($validated['per_page'] ?? 15);
            $results = $this->service->searchVerses($validated['q'], $perPage);
            $results->through(fn ($verse) => new VerseResource($verse));

            return $this->paginated($results);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
