<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AdhkarSectionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'category_id'    => $this->adhkar_category_id,
            'name'           => $this->getTranslations('name'),
            'order_randomly' => $this->order_randomly,
            'display_order'  => $this->display_order,
            'items'          => AdhkarItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
