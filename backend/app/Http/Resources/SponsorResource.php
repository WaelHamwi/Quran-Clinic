<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SponsorResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                   => $this->id,
            'name'                 => $this->getTranslations('name'),
            'logo_url'             => $this->logoUrl(),
            'website_url'          => $this->website_url,
            'target_all_countries' => $this->target_all_countries,
            'target_countries'     => $this->target_countries ?? [],
            'is_featured'          => $this->is_featured,
            'display_on_launch'    => $this->display_on_launch,
            'display_order'        => $this->display_order,
        ];
    }
}
