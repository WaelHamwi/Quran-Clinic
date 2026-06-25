<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SurahResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->getTranslations('name'),
            'transliteration' => $this->transliteration,
            'type'            => $this->type,
            'total_verses'    => $this->total_verses,
            'verses'          => VerseResource::collection($this->whenLoaded('verses')),
        ];
    }
}
