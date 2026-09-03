<?php

namespace App\Http\Resources;

use App\Models\Category;
use App\Models\Disease;
use App\Models\RecordingAttachment;
use App\Models\Subcategory;
use Illuminate\Http\Resources\Json\JsonResource;

class RecordingResource extends JsonResource
{
    public function toArray($request): array
    {
        // When loaded via a parent's recordings() relation (e.g. $disease->recordings),
        // Eloquent sets $this->pivot to the RecordingAttachment row for that parent —
        // this is the "which list did this arrive in" context the mobile app expects.
        // Outside that context (e.g. /recordings?disease_id=, /general-ruqyah) fall back
        // to the first attachment so the same flat shape still comes through.
        $context = $this->pivot ?? $this->attachments->first();

        return [
            'id'                    => $this->id,
            // The occurrence, as opposed to the recording: one ruqyah may play
            // the same recording at its beginning, middle and end, and those
            // arrive as three entries sharing this `id`. The pivot row is what
            // tells them apart, so the app keys sessions by it.
            'attachment_id'         => isset($context->id) ? (int) $context->id : null,
            'disease_id'            => $this->resolveOwnerId($context, Disease::class),
            'category_id'           => $this->resolveOwnerId($context, Category::class),
            'subcategory_id'        => $this->resolveOwnerId($context, Subcategory::class),
            'session_number'        => $context->session_number ?? null,
            'description'           => $this->getTranslations('description') ?: null,
            'segments'              => collect($this->segments ?? [])->values()->map(fn($s) => [
                'start'   => (float) ($s['start'] ?? 0),
                'end'     => (float) ($s['end'] ?? 0),
                'text_ar' => trim($s['text_ar'] ?? ''),
                'text_en' => trim($s['text_en'] ?? ''),
            ])->filter(fn($s) => $s['end'] > $s['start'])->values()->all() ?: null,
            'audio_url'             => $this->streamUrl(),
            'duration_seconds'      => $this->duration_seconds,
            'type'                  => $this->type,
            'is_general'            => $this->is_general,
            'is_free'               => $this->isFreeSession(),
            'requires_subscription' => ! $this->isFreeSession(),
            'plays_count'           => $this->plays_count,
        ];
    }

    private function resolveOwnerId(?RecordingAttachment $context, string $attachableClass): ?int
    {
        if (! $context || $context->attachable_type !== $attachableClass) {
            return null;
        }

        return (int) $context->attachable_id;
    }
}
