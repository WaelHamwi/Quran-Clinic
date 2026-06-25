<?php

namespace Database\Seeders;

use App\Models\FeatureFlag;
use Illuminate\Database\Seeder;

class FeatureFlagSeeder extends Seeder
{
    private const KEYS = ['hospital', 'adhkar', 'tahsinat', 'mushaf', 'courses', 'sponsors', 'ask_me'];

    public function run(): void
    {
        foreach (self::KEYS as $key) {
            FeatureFlag::firstOrCreate(['feature_key' => $key], ['is_visible' => true]);
        }

        $this->command->info('Feature flags seeded (' . count(self::KEYS) . ' keys).');
    }
}
