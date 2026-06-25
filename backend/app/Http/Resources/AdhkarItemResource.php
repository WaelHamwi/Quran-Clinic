<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AdhkarItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'category_id'   => $this->adhkar_category_id,
            'section_id'    => $this->adhkar_section_id,
            'text'          => $this->getTranslations('text'),
            'image'         => $this->imageUrl(),
            'repetitions'   => $this->repetitions,
            'hint'          => $this->getTranslations('hint'),
            'daleel'        => $this->getTranslations('daleel'),
            'display_order' => $this->display_order,
        ];
    }
}
