<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Services\CourseService;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    public function __construct(private CourseService $service) {}

    public function index(): JsonResponse
    {
        try {
            return $this->success(CourseResource::collection($this->service->getAll()));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
