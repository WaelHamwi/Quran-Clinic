<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AdhkarCategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->getTranslations('name'),
            'slug'          => $this->slug,
            'icon'          => $this->iconUrl(),
            'day_number'    => $this->day_number,
            'display_order' => $this->display_order,
            'items_count'   => $this->whenCounted('items'),
            'sections'      => AdhkarSectionResource::collection($this->whenLoaded('sections')),
            'items'         => AdhkarItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
