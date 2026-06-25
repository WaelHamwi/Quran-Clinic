<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TahsinatSectionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'category_id'    => $this->tahsinat_category_id,
            'name'           => $this->getTranslations('name'),
            'order_randomly' => $this->order_randomly,
            'display_order'  => $this->display_order,
            'items'          => TahsinatItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
