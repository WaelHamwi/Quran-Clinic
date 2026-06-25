<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class VerseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'surah_id'     => $this->surah_id,
            'verse_number' => $this->verse_number,
            'text'         => $this->getTranslations('text'),
        ];
    }
}
