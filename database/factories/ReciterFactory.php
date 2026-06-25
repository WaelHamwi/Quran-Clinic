<?php

namespace Database\Factories;

use App\Models\Reciter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reciter>
 */
class ReciterFactory extends Factory
{
    protected $model = Reciter::class;

    public function definition(): array
    {
        return [
            'name'      => ['ar' => 'القارئ', 'en' => $this->faker->name()],
            'bio'       => ['ar' => '', 'en' => $this->faker->sentence()],
            'is_active' => true,
        ];
    }
}
