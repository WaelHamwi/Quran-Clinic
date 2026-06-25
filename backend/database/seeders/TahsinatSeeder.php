<?php

namespace Database\Seeders;

use App\Models\TahsinatCategory;
use App\Models\TahsinatItem;
use App\Models\TahsinatSection;
use Illuminate\Database\Seeder;

class TahsinatSeeder extends Seeder
{
    public function run(): void
    {
        if (TahsinatCategory::count() > 0) {
            $this->command->info('Tahsinat already seeded. Skipping.');

            return;
        }

        $categories = [
            ['name' => ['ar' => 'تحصين النفس', 'en' => 'Self-Fortification'],          'slug' => 'self',   'applicability' => 'self'],
            ['name' => ['ar' => 'تحصين الغير', 'en' => 'Fortification for Others'],     'slug' => 'others', 'applicability' => 'others'],
        ];

        foreach ($categories as $order => $cat) {
            $category = TahsinatCategory::create([
                'name'          => $cat['name'],
                'slug'          => $cat['slug'],
                'display_order' => $order,
                'is_active'     => true,
            ]);

            $sections = [
                ['ar' => 'القسم الأول', 'en' => 'First Section',  'order_randomly' => false],
                ['ar' => 'القسم الثاني', 'en' => 'Second Section', 'order_randomly' => true],
            ];

            foreach ($sections as $sOrder => $sec) {
                $section = TahsinatSection::create([
                    'tahsinat_category_id' => $category->id,
                    'name'                 => ['ar' => $sec['ar'], 'en' => $sec['en']],
                    'order_randomly'       => $sec['order_randomly'],
                    'display_order'        => $sOrder,
                ]);

                for ($i = 1; $i <= 3; $i++) {
                    TahsinatItem::create([
                        'tahsinat_category_id' => $category->id,
                        'tahsinat_section_id'  => $section->id,
                        'label'                => ['ar' => "آية رقم {$i}", 'en' => "Verse {$i}"],
                        'text'                 => [
                            'ar' => "نص الآية القرآنية رقم {$i} للتحصين - {$sec['ar']}",
                            'en' => "Sample protective verse {$i} in {$sec['en']}",
                        ],
                        'repetitions'          => 3,
                        'hint'                 => ['ar' => 'تقرأ بتدبر', 'en' => 'Recite with reflection'],
                        'applicability'        => $cat['applicability'],
                        'display_order'        => $i,
                    ]);
                }
            }
        }

        $this->command->info('Tahsinat sample data seeded (2 categories, sections + items).');
    }
}
