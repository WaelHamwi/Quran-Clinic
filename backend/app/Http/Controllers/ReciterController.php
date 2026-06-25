<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReciterResource;
use App\Services\ReciterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReciterController extends Controller
{
    public function __construct(private ReciterService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $perPage  = min((int) $request->get('per_page', 15), 100);
            $reciters = $this->service->getAllActive($perPage);
            $reciters->through(fn ($reciter) => new ReciterResource($reciter));
            return $this->paginated($reciters);
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $reciter = $this->service->getReciterWithRecitations($id);
            if (!$reciter) {
                return $this->error('Reciter not found', 404);
            }
            return $this->success(new ReciterResource($reciter));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
