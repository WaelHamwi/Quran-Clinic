<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TahsinatCategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->getTranslations('name'),
            'slug'          => $this->slug,
            'icon'          => $this->iconUrl(),
            'display_order' => $this->display_order,
            'items_count'   => $this->whenCounted('items'),
            'sections'      => TahsinatSectionResource::collection($this->whenLoaded('sections')),
            'items'         => TahsinatItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
