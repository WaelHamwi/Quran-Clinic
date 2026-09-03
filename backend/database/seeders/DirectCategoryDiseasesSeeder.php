<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Disease;
use Illuminate\Database\Seeder;

/**
 * Data-entry seeder for the `disease_direct` categories — الأطفال، الممتلكات
 * الشخصية، البيوت والعلاقات، رقى متنوعة.
 *
 * These categories carry no subcategory layer, so each entry is created as a
 * direct disease (`category_id`) and inherits its category's icon.
 *
 * Idempotent: entries are matched by Arabic name within their category, so
 * re-running only fills gaps.
 */
class DirectCategoryDiseasesSeeder extends Seeder
{
    /** @var array<string, list<array{0:string,1:string}>> category (ar) => [[ar, en], ...] */
    private const DATA = [
        'الأطفال' => [
            ['مشاكل الحفظ وسرعة النسيان', 'Memorization Problems & Forgetfulness'],
            ['التأتأة وتأخر الكلام', 'Stuttering & Speech Delay'],
            ['التبول اللا إرادي', 'Bedwetting'],
            ['الخوف والقلق وكثرة البكاء', 'Fear, Anxiety & Excessive Crying'],
            ['لتأخر نضج عقل الطفل', "Delayed Mental Development"],
            ['لفتح الشهية', 'Appetite Stimulation'],
            ['لفرط الحركة', 'Hyperactivity'],
            ['للنوم', 'Sleep'],
        ],
        'الممتلكات الشخصية' => [
            ['البيوت', 'Homes'],
            ['رقية باب الرزق (المتجر أو المؤسسة)', 'Ruqyah for Livelihood (Shop or Business)'],
            ['رقية السيارة', 'Ruqyah for the Car'],
            ['رقية المزارع والبساتين', 'Ruqyah for Farms & Orchards'],
        ],
        'البيوت والعلاقات' => [
            ['تيسير الزواج', 'Facilitating Marriage'],
            ['المودة بين الزوجين', 'Affection Between Spouses'],
            ['الترابط الأسري', 'Family Bonding'],
        ],
        // Currently type `direct` (holds recordings itself), so the entries below
        // are skipped until the category is converted to `disease_direct`.
        'رقى متنوعة' => [
            ['لاستيقاظ لصلاة الفجر', 'Waking for Fajr Prayer'],
            ['قضاء الدين والرزق', 'Settling Debt & Provision'],
            ['الخوف من ذي سلطان جائر', 'Fear of an Unjust Ruler'],
            ['ضيق الصدر والنكد', 'Distress & Gloom'],
            ['لإيجاد المفقودات', 'Finding Lost Items'],
            ['الأرق', 'Insomnia'],
        ],
    ];

    public function run(): void
    {
        // Index by both locales — some rows were entered with Arabic in the `en` slot.
        $categories = [];
        foreach (Category::withCount('subcategories')->get() as $category) {
            foreach (['ar', 'en'] as $locale) {
                $key = self::normalize($category->getTranslation('name', $locale, false) ?? '');
                if ($key !== '') {
                    $categories[$key] ??= $category;
                }
            }
        }

        $created = $skipped = 0;

        foreach (self::DATA as $catName => $entries) {
            $category = $categories[self::normalize($catName)] ?? null;

            if (! $category) {
                $this->command->warn("Category not found: {$catName} — skipping " . \count($entries) . ' entry(ies).');

                continue;
            }

            // Only `disease_direct` categories accept diseases without a subcategory.
            if (! $category->isDiseaseDirect()) {
                $this->command->warn("Category '{$catName}' is type '{$category->type}', not 'disease_direct'; direct diseases cannot be attached. Skipping " . \count($entries) . ' entry(ies).');

                continue;
            }

            if ($category->subcategories_count > 0) {
                $this->command->warn("Category '{$catName}' already has subcategories; direct diseases cannot be attached. Skipping " . \count($entries) . ' entry(ies).');

                continue;
            }

            $existing = Disease::withTrashed()
                ->where('category_id', $category->id)
                ->get()
                ->keyBy(fn (Disease $d) => self::normalize($d->getTranslation('name', 'ar', false) ?? ''));

            $order = (int) Disease::where('category_id', $category->id)->max('display_order');

            foreach ($entries as [$ar, $en]) {
                if ($disease = $existing->get(self::normalize($ar))) {
                    if (! $disease->icon && $category->icon) {
                        $disease->update(['icon' => $category->icon]);
                        $this->command->line("  icon backfilled: {$ar}");
                    }
                    $skipped++;

                    continue;
                }

                Disease::create([
                    'category_id'   => $category->id,
                    'name'          => ['ar' => $ar, 'en' => $en],
                    'icon'          => $category->icon,
                    'display_order' => ++$order,
                    'is_active'     => true,
                ]);
                $created++;
            }
        }

        $this->command->info("Direct-category diseases: {$created} created, {$skipped} already present.");
    }

    private static function normalize(string $value): string
    {
        return preg_replace('/\s+/u', ' ', trim($value));
    }
}
