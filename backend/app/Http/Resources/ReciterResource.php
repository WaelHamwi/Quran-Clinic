<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReciterResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->getTranslations('name'),
            'bio'         => $this->getTranslations('bio') ?: null,
            'photo_path'  => $this->photo_path,
            'is_active'   => $this->is_active,
            'recitations' => RecitationResource::collection($this->whenLoaded('recitations')),
        ];
    }
}
