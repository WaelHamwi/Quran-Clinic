<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Models\Concerns\InvalidatesCache;
use App\Services\CourseService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasTranslations, InvalidatesCache;

    protected function cacheKeysToForget(): array
    {
        return CourseService::CACHE_KEYS;
    }

    protected $fillable = [
        'title', 'description', 'target_audience', 'course_topics', 'registration_info',
        'instructor_name', 'price', 'start_date', 'image_url',
        'whatsapp_link', 'is_coming_soon', 'is_active', 'display_order',
    ];

    public array $translatable = [
        'title', 'description', 'target_audience', 'course_topics', 'registration_info',
    ];

    protected function casts(): array
    {
        return [
            'price'          => 'decimal:2',
            'start_date'     => 'date',
            'is_coming_soon' => 'boolean',
            'is_active'      => 'boolean',
            'display_order'  => 'integer',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('id');
    }
}
