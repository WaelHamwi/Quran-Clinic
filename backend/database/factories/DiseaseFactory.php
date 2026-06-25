<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Disease;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Disease>
 *
 * Diseases must belong to exactly one of a `disease_direct` category or a subcategory.
 * This factory defaults to a `disease_direct` category. The slug is derived from the
 * name by the model's saving hook, so it is intentionally not set here.
 */
class DiseaseFactory extends Factory
{
    protected $model = Disease::class;

    public function definition(): array
    {
        return [
            'category_id'    => Category::factory()->diseaseDirect(),
            'subcategory_id' => null,
            'name'           => ['ar' => 'مرض', 'en' => $this->faker->unique()->words(2, true)],
            'display_order'  => 0,
            'is_active'      => true,
        ];
    }

    public function named(string $ar, string $en): static
    {
        return $this->state(fn () => ['name' => ['ar' => $ar, 'en' => $en]]);
    }
}
