<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RecordingResource;
use App\Models\Recording;
use App\Models\User;
use App\Services\RecordingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class RecordingController extends Controller
{
    /** Premium recording audio lives on the private disk; never the public one. */
    private const AUDIO_DISK = 'local';

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
            $viewer    = $this->resolveViewer($request);

            if (! $recording || ! $this->service->canView($recording, $viewer)) {
                return $this->error('Recording not found', 404);
            }

            if (! $this->service->canAccess($recording, $viewer)) {
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

    /**
     * Gated audio stream. Enforces the subscription/trial gate (free sessions stay open to
     * guests), then serves the private file via Nginx X-Accel-Redirect — or proxies a remote
     * CDN URL. This is the only path to recording audio; the files are not publicly reachable.
     */
    public function audio(Request $request, int $id): Response
    {
        try {
            $recording = $this->service->find($id);
            $viewer    = $this->resolveViewer($request);

            if (! $recording || ! $this->service->canView($recording, $viewer)) {
                return $this->error('Recording not found', 404);
            }

            if (! $this->service->canAccess($recording, $viewer)) {
                return $this->error('This session requires an active subscription or trial.', 403);
            }

            return $this->serveAudio($request, $recording, $id);
        } catch (\Throwable $e) {
            Log::error('RecordingController@audio id=' . $id . ': ' . $e->getMessage());
            return $this->error('Server error', 500);
        }
    }

    /**
     * Admin-only preview, reachable from the Filament "Listen" action. Authenticated by the
     * web session (Filament guard) + admin check in the route middleware — no subscription
     * gate, so admins can preview any session. Serves the same private file.
     */
    public function adminAudio(Request $request, Recording $recording): Response
    {
        try {
            $user = $request->user();
            if (! $user || ! $user->isAdmin()) {
                return $this->error('Forbidden', 403);
            }

            return $this->serveAudio($request, $recording, $recording->id);
        } catch (\Throwable $e) {
            Log::error('RecordingController@adminAudio id=' . $recording->id . ': ' . $e->getMessage());
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

    public function play(Request $request, int $id): JsonResponse
    {
        try {
            $recording = $this->service->find($id);

            if (! $recording || ! $this->service->canView($recording, $this->resolveViewer($request))) {
                return $this->error('Recording not found', 404);
            }

            $this->service->recordPlay($recording);

            return $this->success(['plays_count' => $recording->plays_count + 1]);
        } catch (\Throwable $e) {
            return $this->error('Server error', 500);
        }
    }

    /** Serve recording audio: remote CDN → proxied; local → X-Accel-Redirect or response()->file. */
    private function serveAudio(Request $request, Recording $recording, int $id): Response
    {
        $path = (string) $recording->audio_path;

        if ($path === '') {
            return $this->error('Audio file not found', 404);
        }

        if (str_starts_with($path, 'http')) {
            return $this->proxyRemoteAudio($request, $id, $path);
        }

        $disk = Storage::disk(self::AUDIO_DISK);
        if (! $disk->exists($path)) {
            return $this->error('Audio file not found', 404);
        }

        if (config('scalability.audio.use_x_accel')) {
            $internal = rtrim((string) config('scalability.audio.protected_x_accel_prefix'), '/')
                . '/' . ltrim($path, '/');

            return response('', 200, [
                'Content-Type'     => 'audio/mpeg',
                'Accept-Ranges'    => 'bytes',
                'X-Accel-Redirect' => $internal,
            ]);
        }

        return response()->file($disk->path($path), ['Content-Type' => 'audio/mpeg']);
    }

    private function proxyRemoteAudio(Request $request, int $id, string $path): Response
    {
        $clientHeaders = [];
        if ($rangeHeader = $request->header('Range')) {
            $clientHeaders['Range'] = $rangeHeader;
        }

        $cdnResponse = Http::withOptions([
            'verify'  => true,
            'stream'  => true,
            'timeout' => 60,
        ])->withHeaders($clientHeaders)->get($path);

        $status = $cdnResponse->status();
        if ($status >= 400) {
            Log::error("RecordingController@audio CDN returned {$status} for recording {$id}: {$path}");
            return $this->error('Audio source unavailable', 502);
        }

        $responseHeaders = ['Content-Type' => 'audio/mpeg', 'Accept-Ranges' => 'bytes'];
        if ($len   = $cdnResponse->header('Content-Length')) { $responseHeaders['Content-Length'] = $len; }
        if ($range = $cdnResponse->header('Content-Range'))  { $responseHeaders['Content-Range']  = $range; }

        $stream = $cdnResponse->toPsrResponse()->getBody();

        return response()->stream(function () use ($stream) {
            while (! $stream->eof()) {
                echo $stream->read(8192);
                if (connection_aborted()) {
                    break;
                }
            }
        }, $status, $responseHeaders);
    }

    /**
     * Resolve the requesting user without forcing auth: the mobile app sends a Sanctum
     * bearer token, the Filament admin preview sends a web session cookie. Either may be
     * absent (guest), in which case only free sessions are accessible.
     */
    private function resolveViewer(Request $request): ?User
    {
        foreach (['sanctum', 'web'] as $guard) {
            try {
                if ($user = $request->user($guard)) {
                    return $user;
                }
            } catch (\Throwable) {
                // Guard not registered in this context — try the next one.
            }
        }

        return null;
    }
}
