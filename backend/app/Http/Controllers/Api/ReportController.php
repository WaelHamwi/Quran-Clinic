<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller
{
    public function __construct(private ReportService $service) {}

    public function store(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'type'    => 'required|string|in:bug,suggestion',
                'message' => 'required|string|max:2000',
                'name'    => 'nullable|string|max:255', // guest-supplied name
                'image'   => 'nullable|image|max:8192', // 8 MB (matches PHP upload_max_filesize)
            ]);

            // Public endpoint: attribute to the user when a Sanctum token is present,
            // otherwise accept anonymous reports (guests can reach this screen too).
            $userId = $request->user()?->id;

            $report = $this->service->submit($userId, $data, $request->file('image'));

            return $this->success(['id' => $report->id], 'Report submitted', 201);
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
