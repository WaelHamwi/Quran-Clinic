<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        if (Course::count() > 0) {
            $this->command->info('Courses already seeded. Skipping.');

            return;
        }

        $title = [
            'ar' => 'دورة تأهيل الرقاة (المستوى التأسيسي)',
            'en' => 'Ruqyah Practitioner Qualification (Foundation Level)',
        ];
        $description = [
            'ar' => 'تعلّم الأصول الشرعية للرقية، خطوات التشخيص الصحيح، والضوابط الشرعية للراقي من الكتاب والسُّنة النبوية بطريقة منهجية.',
            'en' => 'Learn the legitimate foundations of Ruqyah, the steps of correct diagnosis, and the practitioner’s guidelines from the Qur’an and Sunnah in a methodical way.',
        ];
        $targetAudience = [
            'ar' => 'للمهتمين بتعلم أصول الرقية على منهج صحيح، والراغبين في تحصين أنفسهم وأهل بيتهم بوعي وبصيرة.',
            'en' => 'For those interested in learning the foundations of Ruqyah correctly, and who wish to protect themselves and their families with awareness and insight.',
        ];
        $courseTopics = [
            'ar' => "ضوابط وشروط الرقية الشرعية الصحيحة.\nالتفريق بين الأعراض الروحية، والنفسية، والعضوية.\nالأخطاء الشائعة والبدع وكيفية تجنبها.\nالتحصين الذاتي للراقي وللمريض.",
            'en' => "Rules and conditions of correct legitimate Ruqyah.\nDistinguishing spiritual, psychological, and physical symptoms.\nCommon mistakes and innovations and how to avoid them.\nSelf-protection for the practitioner and the patient.",
        ];
        $registrationInfo = [
            'ar' => "نظام الدورة: عن بُعد (أونلاين) عبر Zoom.\nالمدة التدريبية: 3 أيام متتالية.\nالاعتماد: إفادة إتمام للمستوى التأسيسي.",
            'en' => "Format: Remote (online) via Zoom.\nDuration: 3 consecutive days.\nAccreditation: Completion certificate for the foundation level.",
        ];

        Course::create([
            'title'             => $title,
            'description'       => $description,
            'target_audience'   => $targetAudience,
            'course_topics'     => $courseTopics,
            'registration_info' => $registrationInfo,
            'instructor_name'   => 'الشيخ د. عبدالله عبدالرحمن',
            'price'             => 20,
            'start_date'        => '2026-10-15',
            'image_url'         => null,
            'whatsapp_link'     => 'https://wa.me/0000000000',
            'is_coming_soon'    => false,
            'is_active'         => true,
            'display_order'     => 0,
        ]);

        foreach ([1, 2] as $i) {
            Course::create([
                'title'             => $title,
                'description'       => $description,
                'target_audience'   => $targetAudience,
                'course_topics'     => $courseTopics,
                'registration_info' => $registrationInfo,
                'instructor_name'   => 'الشيخ د. عبدالله عبدالرحمن',
                'price'             => 20,
                'start_date'        => null,
                'image_url'         => null,
                'whatsapp_link'     => 'https://wa.me/0000000000',
                'is_coming_soon'    => true,
                'is_active'         => true,
                'display_order'     => $i,
            ]);
        }

        $this->command->info('Course sample data seeded.');
    }
}
