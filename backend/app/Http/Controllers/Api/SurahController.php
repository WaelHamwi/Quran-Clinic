<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SurahResource;
use App\Services\SurahService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SurahController extends Controller
{
    public function __construct(private SurahService $service) {}

    public function index(Request $request): JsonResponse
    {
        try {
            // Cap = 114 (the fixed surah count) so the mobile app can pull the whole
            // list in one request instead of 8 paginated round trips. The list is
            // served from the ModelCache aggregate either way, so this costs nothing.
            $perPage = min((int) $request->get('per_page', 15), 114);
            $page    = max((int) $request->get('page', 1), 1);
            $surahs  = $this->service->getAllSurahs($perPage, $page);
            $surahs->through(fn ($surah) => new SurahResource($surah));
            return $this->paginated($surahs);
        } catch (\Throwable $e) {
            \Log::error('SurahController@index: ' . $e->getMessage());
            return $this->error('Server error', 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $surah = $this->service->getSurahWithVerses($id);
            if (!$surah) {
                return $this->error('Surah not found', 404);
            }
            return $this->success(new SurahResource($surah));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
