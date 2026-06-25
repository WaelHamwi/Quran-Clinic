<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $en = $this->faker->unique()->words(2, true);

        return [
            'name'          => ['ar' => 'تصنيف', 'en' => $en],
            'slug'          => Str::slug($en) . '-' . $this->faker->unique()->randomNumber(5),
            'type'          => 'standard',
            'display_order' => 0,
            'is_active'     => true,
        ];
    }

    /** A category that accepts diseases attached directly to it. */
    public function diseaseDirect(): static
    {
        return $this->state(fn () => ['type' => 'disease_direct']);
    }
}
