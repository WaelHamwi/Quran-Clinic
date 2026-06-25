<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationPreferenceResource;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $service) {}

    public function preferences(Request $request): JsonResponse
    {
        try {
            $preference = $this->service->getPreferences($request->user());

            return $this->success(new NotificationPreferenceResource($preference));
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'adhkar_morning_enabled' => 'nullable|boolean',
                'adhkar_evening_enabled' => 'nullable|boolean',
                'adhkar_sleep_enabled'   => 'nullable|boolean',
                'adhkar_waking_enabled'  => 'nullable|boolean',
                'waking_start_time'      => 'nullable|date_format:H:i',
                'waking_end_time'        => 'nullable|date_format:H:i',
            ]);

            $preference = $this->service->updatePreferences($request->user(), $data);

            return $this->success(new NotificationPreferenceResource($preference));
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    public function registerToken(Request $request): JsonResponse
    {
        try {
            $data = $request->validate(['token' => 'required|string|max:255']);

            $this->service->registerPushToken($request->user(), $data['token']);

            return $this->success(null, 'Push token registered');
        } catch (ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }
}
