<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use App\Services\SponsorService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Sponsor extends Model
{
    use HasTranslations;

    protected $fillable = [
        'name', 'logo_path', 'website_url', 'target_all_countries', 'target_countries',
        'target_genders', 'is_featured', 'display_on_launch', 'display_order', 'is_active',
    ];

    public array $translatable = ['name'];

    protected static function booted(): void
    {
        // Editing a sponsor (incl. the one shown on the splash) must invalidate
        // the cached API payloads so changes appear on the next request.
        static::saved(fn () => SponsorService::flushCache());
        static::deleted(fn () => SponsorService::flushCache());
    }

    protected function casts(): array
    {
        return [
            'target_all_countries' => 'boolean',
            'target_countries'     => 'array',
            'target_genders'       => 'array',
            'is_featured'          => 'boolean',
            'display_on_launch'    => 'boolean',
            'display_order'        => 'integer',
            'is_active'            => 'boolean',
        ];
    }

    /** Whether this sponsor should be shown to a user from the given country. */
    public function targetsCountry(?string $country): bool
    {
        if ($this->target_all_countries || empty($this->target_countries)) {
            return true;
        }

        return $country !== null && \in_array($country, $this->target_countries, true);
    }

    public function logoUrl(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        return str_starts_with($this->logo_path, 'http')
            ? $this->logo_path
            : asset('storage/' . ltrim($this->logo_path, '/'));
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
