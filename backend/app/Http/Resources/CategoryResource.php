<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->getTranslations('name'),
            'slug'           => $this->slug,
            'icon'           => $this->iconUrl(),
            'type'           => $this->type,
            'display_order'  => $this->display_order,
            'subcategories'  => SubcategoryResource::collection($this->whenLoaded('subcategories')),
            'direct_diseases' => DiseaseResource::collection($this->whenLoaded('directDiseases')),
            'recordings'     => RecordingResource::collection($this->whenLoaded('recordings')),
        ];
    }
}
