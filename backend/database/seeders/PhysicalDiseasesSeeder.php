<?php

namespace Database\Seeders;

use App\Models\Disease;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;

/**
 * Data-entry seeder for the "الأمراض العضوية" (Physical Diseases) category.
 *
 * Idempotent: a disease is matched by its Arabic name within its subcategory,
 * so re-running only fills gaps. Each disease inherits its subcategory's icon.
 *
 * Subcategories are matched by Arabic name (whitespace-insensitive) rather than
 * by id, so the same seeder works against local and production databases.
 */
class PhysicalDiseasesSeeder extends Seeder
{
    /** @var array<string, list<array{0:string,1:string}>> subcategory (ar) => [[ar, en], ...] */
    private const DATA = [
        'أنف أذن حنجرة' => [
            ['انسداد الأنف', 'Nasal Congestion'],
            ['سيلان الأنف والرعاف', 'Runny Nose & Nosebleeds'],
            ['التهاب الجيوب الأنفية والحلق', 'Sinus & Throat Inflammation'],
            ['اللحمية في الأنف', 'Nasal Adenoids'],
        ],
        'الصدرية' => [
            ['الربو وضيق النفس والالتهاب الرئوي والسل', 'Asthma, Breathlessness, Pneumonia & Tuberculosis'],
            ['انقطاع النفس أثناء النوم', 'Sleep Apnea'],
            ['الانسداد الرئوي', 'Pulmonary Obstruction'],
            ['الكحة والسعال', 'Cough'],
        ],
        'الجهاز الهضمي' => [
            ['ارتجاع المريء', 'Acid Reflux'],
            ['القولون', 'Colon Disorders'],
            ['الحصوات', 'Gallstones'],
            ['الإمساك', 'Constipation'],
            ['الإسهال', 'Diarrhea'],
            ['النزلات المعوية', 'Gastroenteritis'],
            ['المغص', 'Abdominal Colic'],
            ['حموضة المعدة', 'Stomach Acidity'],
            ['التهابات الجهاز الهضمي', 'Digestive Tract Inflammation'],
            ['انسداد الأمعاء', 'Intestinal Obstruction'],
        ],
        'المزمنة' => [
            ['القلب', 'Heart Conditions'],
            ['الكلى', 'Kidney Conditions'],
            ['الغيبوبة', 'Coma'],
            ['السكر', 'Diabetes'],
            ['الضغط', 'Blood Pressure'],
            ['الجلطات', 'Blood Clots & Strokes'],
            ['الزهايمر', "Alzheimer's Disease"],
            ['الماء الزائد', 'Fluid Retention'],
            ['الحرارة', 'Fever'],
            ['الألم', 'Pain'],
            ['الأورام', 'Tumors'],
        ],
        'النساء والولادة' => [
            ['تأخر الحمل', 'Delayed Pregnancy'],
            ['سقوط الأجنة', 'Miscarriage'],
            ['تسهيل الولادة الإسقاط في حال موت الجنين', 'Easing Childbirth & Delivery of a Deceased Fetus'],
            ['الاستحاضة – استمرار الحيض -', 'Istihadah (Prolonged Bleeding)'],
        ],
        'الكلى والمسالك البولية' => [
            ['القصور الكلوي', 'Kidney Failure'],
            ['احتباس البول', 'Urinary Retention'],
            ['الضعف الجنسي للرجال', 'Male Sexual Weakness'],
            ['التهابات المجرى البولي', 'Urinary Tract Infections'],
            ['الحصوات', 'Kidney Stones'],
        ],
        'الجلدية والتناسلية' => [
            ['حساسية الجلد (حكة شديدة)', 'Skin Allergy (Severe Itching)'],
            ['الطفح الجلدي والصدفية والاكزيما', 'Rash, Psoriasis & Eczema'],
            ['البقع الجلدية والبرص و الحروق', 'Skin Patches, Vitiligo & Burns'],
            ['الحصباء', 'Measles'],
            ['الجذام', 'Leprosy'],
            ['حب الشباب', 'Acne'],
            ['صعوبات الإنجاب', 'Fertility Difficulties'],
            ['العنقز', 'Chickenpox'],
        ],
        'الأعصاب' => [
            ['شلل الوجه', 'Facial Paralysis'],
            ['الشلل الجسدي', 'Bodily Paralysis'],
            ['التهابات الأعصاب', 'Nerve Inflammation'],
            ['الحزام الناري', 'Shingles'],
            ['الصداع', 'Headache'],
            ['الصرع', 'Epilepsy'],
        ],
        'العيون' => [
            ['ضعف البصر واعتلال الشبكية', 'Weak Vision & Retinopathy'],
            ['الالتهابات في العين', 'Eye Inflammation'],
        ],
        'العمليات الجراحية' => [
            ['قبل العمليات الجراحية', 'Before Surgery'],
            ['بعد العمليات الجراحية', 'After Surgery'],
        ],
        'النفسية' => [
            ['الوسواس', 'Obsessive Thoughts'],
            ['الحسد', 'Envy'],
            ['الاكتئاب', 'Depression'],
            ['الأذى الروحي', 'Spiritual Harm'],
        ],
        'الدم' => [
            ['فقر دم', 'Anemia'],
            ['النزيف', 'Bleeding'],
            ['الملاريا', 'Malaria'],
        ],
        'التجميل' => [
            ['الشعر', 'Hair'],
            ['الجلد', 'Skin'],
        ],
    ];

    public function run(): void
    {
        // Index by both locales: some subcategories were entered with the Arabic
        // name in the `en` slot, and a couple word the two locales differently.
        $subcategories = [];
        foreach (Subcategory::withCount('recordings')->get() as $subcategory) {
            foreach (['ar', 'en'] as $locale) {
                $key = self::normalize($subcategory->getTranslation('name', $locale, false) ?? '');
                if ($key !== '') {
                    $subcategories[$key] ??= $subcategory;
                }
            }
        }

        $created = $skipped = 0;

        foreach (self::DATA as $subName => $diseases) {
            $subcategory = $subcategories[self::normalize($subName)] ?? null;

            if (! $subcategory) {
                $this->command->warn("Subcategory not found: {$subName} — skipping " . \count($diseases) . ' disease(s).');

                continue;
            }

            // A subcategory holding its own recordings cannot also hold diseases.
            if ($subcategory->recordings_count > 0) {
                $this->command->warn("Subcategory '{$subName}' has {$subcategory->recordings_count} direct recording(s); diseases cannot be attached. Skipping " . \count($diseases) . ' disease(s).');

                continue;
            }

            $existing = Disease::withTrashed()
                ->where('subcategory_id', $subcategory->id)
                ->get()
                ->keyBy(fn (Disease $d) => self::normalize($d->getTranslation('name', 'ar', false) ?? ''));

            $order = (int) Disease::where('subcategory_id', $subcategory->id)->max('display_order');

            foreach ($diseases as [$ar, $en]) {
                if ($disease = $existing->get(self::normalize($ar))) {
                    // Already entered — only backfill the inherited icon if it is missing.
                    if (! $disease->icon && $subcategory->icon) {
                        $disease->update(['icon' => $subcategory->icon]);
                        $this->command->line("  icon backfilled: {$ar}");
                    }
                    $skipped++;

                    continue;
                }

                Disease::create([
                    'subcategory_id' => $subcategory->id,
                    'name'           => ['ar' => $ar, 'en' => $en],
                    'icon'           => $subcategory->icon,
                    'display_order'  => ++$order,
                    'is_active'      => true,
                ]);
                $created++;
            }
        }

        $this->command->info("Physical diseases: {$created} created, {$skipped} already present.");
    }

    private static function normalize(string $value): string
    {
        return preg_replace('/\s+/u', ' ', trim($value));
    }
}
