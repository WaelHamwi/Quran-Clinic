<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RecordingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'disease_id'            => $this->disease_id,
            'category_id'           => $this->category_id,
            'subcategory_id'        => $this->subcategory_id,
            'session_number'        => $this->session_number,
            'description'           => $this->getTranslations('description') ?: null,
            'segments'              => collect($this->segments ?? [])->values()->map(fn($s) => [
                'start'   => (float) ($s['start'] ?? 0),
                'end'     => (float) ($s['end'] ?? 0),
                'text_ar' => trim($s['text_ar'] ?? ''),
                'text_en' => trim($s['text_en'] ?? ''),
            ])->filter(fn($s) => $s['end'] > $s['start'])->values()->all() ?: null,
            'audio_url'             => $this->streamUrl(),
            'duration_seconds'      => $this->duration_seconds,
            'is_general'            => $this->is_general,
            'is_free'               => $this->isFreeSession(),
            'requires_subscription' => ! $this->isFreeSession(),
            'plays_count'           => $this->plays_count,
        ];
    }
}
