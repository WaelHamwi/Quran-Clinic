<?php

namespace Database\Factories;

use App\Models\Recording;
use App\Services\RecordingAttachmentService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Recording>
 */
class RecordingFactory extends Factory
{
    protected $model = Recording::class;

    public function definition(): array
    {
        return [
            'description'      => [
                'ar' => 'وصف ' . $this->faker->unique()->numberBetween(1, 1000000),
                'en' => 'Description ' . $this->faker->unique()->numberBetween(1, 1000000),
            ],
            'segments'         => null,
            'audio_path'       => 'recordings/' . $this->faker->unique()->lexify('????????') . '.mp3',
            'duration_seconds' => 120,
            'type'             => Recording::TYPE_DETAILED,
            'is_general'       => false,
            'plays_count'      => 0,
        ];
    }

    public function free(): static
    {
        return $this->state(fn () => ['type' => Recording::TYPE_SUMMARIZED]);
    }

    public function summarized(): static
    {
        return $this->state(fn () => ['type' => Recording::TYPE_SUMMARIZED]);
    }

    public function detailed(): static
    {
        return $this->state(fn () => ['type' => Recording::TYPE_DETAILED]);
    }

    public function localFile(string $path): static
    {
        return $this->state(fn () => ['audio_path' => $path]);
    }

    public function remote(string $url = 'https://cdn.example.com/ruqyah/sample.mp3'): static
    {
        return $this->state(fn () => ['audio_path' => $url]);
    }

    /** Attaches the created recording to a Category / Subcategory / Disease via the normal attach flow. */
    public function attachedTo(string $attachableType, int $attachableId): static
    {
        return $this->afterCreating(function (Recording $recording) use ($attachableType, $attachableId): void {
            app(RecordingAttachmentService::class)->attach($recording, $attachableType, $attachableId);
        });
    }
}
