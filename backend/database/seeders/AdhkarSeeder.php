<?php

namespace Database\Seeders;

use App\Models\AdhkarCategory;
use App\Models\AdhkarItem;
use App\Models\AdhkarSection;
use Illuminate\Database\Seeder;

class AdhkarSeeder extends Seeder
{
    public function run(): void
    {
        if (AdhkarCategory::count() > 0) {
            $this->command->info('Adhkar already seeded. Skipping.');

            return;
        }

        $categories = [
            ['ar' => 'أذكار الصباح', 'en' => 'Morning Adhkar',  'slug' => 'morning'],
            ['ar' => 'أذكار المساء', 'en' => 'Evening Adhkar',  'slug' => 'evening'],
            ['ar' => 'أذكار النوم',  'en' => 'Sleep Adhkar',    'slug' => 'sleep'],
            ['ar' => 'أذكار الاستيقاظ', 'en' => 'Waking Adhkar', 'slug' => 'waking'],
        ];

        foreach ($categories as $order => $cat) {
            $category = AdhkarCategory::create([
                'name'          => ['ar' => $cat['ar'], 'en' => $cat['en']],
                'slug'          => $cat['slug'],
                'day_number'    => null,
                'display_order' => $order,
                'is_active'     => true,
            ]);

            $sections = [
                ['ar' => 'القسم الأول', 'en' => 'First Section',  'order_randomly' => false],
                ['ar' => 'القسم الثاني', 'en' => 'Second Section', 'order_randomly' => true],
            ];

            foreach ($sections as $sOrder => $sec) {
                $section = AdhkarSection::create([
                    'adhkar_category_id' => $category->id,
                    'name'               => ['ar' => $sec['ar'], 'en' => $sec['en']],
                    'order_randomly'     => $sec['order_randomly'],
                    'display_order'      => $sOrder,
                ]);

                for ($i = 1; $i <= 3; $i++) {
                    AdhkarItem::create([
                        'adhkar_category_id' => $category->id,
                        'adhkar_section_id'  => $section->id,
                        'text'               => [
                            'ar' => "ذكر رقم {$i} من {$sec['ar']} - {$cat['ar']}",
                            'en' => "Sample dhikr {$i} in {$sec['en']} of {$cat['en']}",
                        ],
                        'repetitions'        => $i === 1 ? 3 : 1,
                        'hint'               => [
                            'ar' => 'يُقال بخشوع وتدبر.',
                            'en' => 'Recite with presence of heart.',
                        ],
                        'daleel'             => [
                            'ar' => 'رواه البخاري ومسلم',
                            'en' => 'Narrated by Bukhari and Muslim',
                        ],
                        'display_order'      => $i,
                    ]);
                }
            }
        }

        $this->command->info('Adhkar sample data seeded (4 categories, sections + items).');
    }
}
