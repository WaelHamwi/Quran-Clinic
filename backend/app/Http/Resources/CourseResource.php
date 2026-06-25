<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'title'             => $this->getTranslations('title'),
            'description'       => $this->getTranslations('description'),
            'target_audience'   => $this->getTranslations('target_audience'),
            'course_topics'     => $this->getTranslations('course_topics'),
            'registration_info' => $this->getTranslations('registration_info'),
            'instructor_name'   => $this->instructor_name,
            'price'             => $this->price,
            'start_date'        => $this->start_date?->toDateString(),
            'image_url'         => $this->image_url,
            'whatsapp_link'     => $this->whatsapp_link,
            'is_coming_soon'    => $this->is_coming_soon,
            'display_order'     => $this->display_order,
        ];
    }
}
