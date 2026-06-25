<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DiseaseResource;
use App\Services\DiseaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DiseaseController extends Controller
{
    public function __construct(private DiseaseService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $perPage   = min((int) $request->get('per_page', 15), 100);
            $paginator = $this->service->paginate($perPage);
            $paginator->through(fn ($disease) => new DiseaseResource($disease));

            return $this->paginated($paginator);
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function show(string $slug): JsonResponse
    {
        try {
            $disease = $this->service->getBySlug($slug);

            if (! $disease) {
                return $this->error('Disease not found', 404);
            }

            return $this->success(new DiseaseResource($disease));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function search(Request $request): JsonResponse
    {
        try {
            $data = $request->validate(['q' => 'required|string|min:2|max:200']);

            return $this->success(DiseaseResource::collection($this->service->search($data['q'])));
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
