<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Wraps the `['kind' => ..., 'node' => Category|Subcategory]` shape returned by
 * FavoriteNodeRepository::forUser() — `node` is one of two different models
 * depending on `kind`, so this isn't a plain Eloquent-model resource.
 */
class FavoriteNodeResource extends JsonResource
{
    public function toArray($request): array
    {
        $node = $this->resource['node'];

        return [
            'kind' => $this->resource['kind'],
            'id'   => $node->id,
            'name' => $node->getTranslations('name'),
            'slug' => $node->slug,
            'icon' => $node->iconUrl(),
        ];
    }
}
