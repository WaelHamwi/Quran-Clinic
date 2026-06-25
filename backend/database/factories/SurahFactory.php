<?php

namespace Database\Factories;

use App\Models\Surah;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Surah>
 */
class SurahFactory extends Factory
{
    protected $model = Surah::class;

    public function definition(): array
    {
        return [
            'name'           => ['ar' => 'سورة', 'en' => $this->faker->unique()->word()],
            'transliteration' => $this->faker->unique()->word(),
            'type'           => $this->faker->randomElement(['meccan', 'medinan']),
            'total_verses'   => $this->faker->numberBetween(3, 286),
        ];
    }
}
