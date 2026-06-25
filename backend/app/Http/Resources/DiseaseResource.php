<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DiseaseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'subcategory_id'   => $this->subcategory_id,
            'category_id'      => $this->category_id,
            'name'             => $this->getTranslations('name'),
            'slug'             => $this->slug,
            'icon'             => $this->iconUrl(),
            'display_order'    => $this->display_order,
            'recordings_count' => $this->whenCounted('recordings'),
            'subcategory'      => new SubcategoryResource($this->whenLoaded('subcategory')),
            'category'         => new CategoryResource($this->whenLoaded('category')),
            'recordings'       => RecordingResource::collection($this->whenLoaded('recordings')),
            'aliases'          => $this->whenLoaded(
                'aliases',
                fn () => $this->aliases->map(fn ($alias) => $alias->getTranslations('alias'))
            ),
        ];
    }
}
