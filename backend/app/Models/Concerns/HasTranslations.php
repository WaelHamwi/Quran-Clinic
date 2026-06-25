<?php

namespace App\Models\Concerns;

use Spatie\Translatable\HasTranslations as SpatieHasTranslations;

trait HasTranslations
{
    use SpatieHasTranslations;

    public function attributesToArray(): array
    {
        $attributes = parent::attributesToArray();

        foreach ($this->getTranslatableAttributes() as $key) {
            $attributes[$key] = $this->getTranslations($key);
        }

        return $attributes;
    }
}
