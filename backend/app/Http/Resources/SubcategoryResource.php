<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SubcategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'category_id'   => $this->category_id,
            'name'          => $this->getTranslations('name'),
            'slug'          => $this->slug,
            'icon'          => $this->iconUrl(),
            'display_order'    => $this->display_order,
            'diseases_count'   => $this->whenCounted('diseases'),
            'recordings_count' => $this->whenCounted('recordings'),
            'category'         => new CategoryResource($this->whenLoaded('category')),
            'diseases'         => DiseaseResource::collection($this->whenLoaded('diseases')),
            'recordings'       => RecordingResource::collection($this->whenLoaded('recordings')),
        ];
    }
}
