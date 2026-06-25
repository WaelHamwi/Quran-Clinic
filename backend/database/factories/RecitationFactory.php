<?php

namespace Database\Factories;

use App\Models\Recitation;
use App\Models\Reciter;
use App\Models\Surah;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Recitation>
 */
class RecitationFactory extends Factory
{
    protected $model = Recitation::class;

    public function definition(): array
    {
        return [
            'reciter_id'       => Reciter::factory(),
            'surah_id'         => Surah::factory(),
            'audio_path'       => 'recitations/' . $this->faker->unique()->lexify('????????') . '.mp3',
            'duration_seconds' => $this->faker->numberBetween(30, 3600),
        ];
    }

    public function localFile(string $path): static
    {
        return $this->state(fn () => ['audio_path' => $path]);
    }

    public function remote(string $url = 'https://cdn.example.com/audio/sample.mp3'): static
    {
        return $this->state(fn () => ['audio_path' => $url]);
    }
}
