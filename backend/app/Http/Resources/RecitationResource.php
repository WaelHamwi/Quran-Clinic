<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class RecitationResource extends JsonResource
{
    public function toArray($request): array
    {
        $path = (string) $this->audio_path;
        // Absolute URL for the mobile client (the public disk URL is relative).
        $audioUrl = str_starts_with($path, 'http://') || str_starts_with($path, 'https://')
            ? $path
            : asset('storage/' . ltrim($path, '/'));

        return [
            'id'               => $this->id,
            'reciter_id'       => $this->reciter_id,
            'surah_id'         => $this->surah_id,
            'audio_path'       => $this->audio_path,
            'audio_url'        => $audioUrl,
            'duration_seconds' => $this->duration_seconds,
            'reciter'          => new ReciterResource($this->whenLoaded('reciter')),
        ];
    }
}
