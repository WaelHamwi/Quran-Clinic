<?php

namespace Database\Seeders;

use App\Models\Sponsor;
use App\Models\SponsorScreenConfig;
use Illuminate\Database\Seeder;

class SponsorSeeder extends Seeder
{
    public function run(): void
    {
        if (Sponsor::count() === 0) {
            Sponsor::create([
                'name'                 => ['ar' => 'الراعي الرسمي', 'en' => 'Official Sponsor'],
                'logo_path'            => null,
                'website_url'          => 'https://example.com',
                'target_all_countries' => true,
                'target_countries'     => [],
                'target_genders'       => ['male', 'female'],
                'is_featured'          => true,
                'display_on_launch'    => true,
                'display_order'        => 0,
                'is_active'            => true,
            ]);
        }

        SponsorScreenConfig::firstOrCreate([], [
            'is_enabled'               => true,
            'display_duration_seconds' => 3,
            'selected_sponsor_id'      => Sponsor::query()->value('id'),
        ]);

        $this->command->info('Sponsor sample data seeded.');
    }
}
