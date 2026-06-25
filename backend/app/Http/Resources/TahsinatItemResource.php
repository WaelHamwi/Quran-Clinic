<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TahsinatItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'category_id'   => $this->tahsinat_category_id,
            'section_id'    => $this->tahsinat_section_id,
            'label'         => $this->getTranslations('label'),
            'text'          => $this->getTranslations('text'),
            'repetitions'   => $this->repetitions,
            'hint'          => $this->getTranslations('hint'),
            'applicability' => $this->applicability,
            'display_order' => $this->display_order,
        ];
    }
}
