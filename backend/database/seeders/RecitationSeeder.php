<?php

namespace Database\Seeders;

use App\Models\Recitation;
use App\Models\Reciter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RecitationSeeder extends Seeder
{
    private const CDN_BASE = 'https://download.quranicaudio.com/quran';

    private const RECITERS = [
        'mishary' => [
            'name_en'  => 'Mishary Rashid Al-Afasy',
            'name_ar'  => 'مشاري راشد العفاسي',
            'cdn_path' => 'mishaari_raashid_al_3afaasee',
            'bio'      => 'Kuwaiti reciter born in 1976. One of the most recognised voices in the Muslim world, known for melodious and clear recitation.',
        ],
        'abdul_basit_murattal' => [
            'name_en'  => 'Abdul Basit Abdus Samad (Murattal)',
            'name_ar'  => 'عبد الباسط عبد الصمد (مرتل)',
            'cdn_path' => 'abdul_basit_murattal',
            'bio'      => 'Egyptian reciter (1927-1988). One of the most famous Qaris in history, known for his unique style and precise pronunciation.',
        ],
        'abdul_basit_mujawwad' => [
            'name_en'  => 'Abdul Basit Abdus Samad (Mujawwad)',
            'name_ar'  => 'عبد الباسط عبد الصمد (مجود)',
            'cdn_path' => 'abdul_basit_mujawwad',
            'bio'      => 'Egyptian reciter with melodic, extended style. Slower and more artistic recitation style.',
        ],
        'husary' => [
            'name_en'  => 'Mahmoud Khaleel Al-Husary',
            'name_ar'  => 'محمود خليل الحصري',
            'cdn_path' => 'mahmood_khaleel_al-husaree',
            'bio'      => 'Egyptian reciter (1917-1980). Known for his precise tajweed and clear enunciation.',
        ],
        'juhaynee' => [
            'name_en'  => 'Abdullah Awwad Al-Juhaynee',
            'name_ar'  => 'عبد الله عواد الجهني',
            'cdn_path' => 'abdullaah_3awwaad_al-juhaynee',
            'bio'      => 'Saudi imam and reciter. Former imam of Masjid Al-Haram in Makkah.',
        ],
        'shuraim' => [
            'name_en'  => 'Saud Al-Shuraim',
            'name_ar'  => 'سعود الشريم',
            'cdn_path' => 'saud_alshuraym',
            'bio'      => 'Saudi reciter and imam of Masjid Al-Haram. Known for his emotional and powerful recitation.',
        ],
        'shatri' => [
            'name_en'  => 'Abu Bakr Al-Shatri',
            'name_ar'  => 'أبو بكر الشاطري',
            'cdn_path' => 'abu_bakr_al-shatri',
            'bio'      => 'Saudi reciter known for his beautiful voice and clear tajweed.',
        ],
        'ghamdi' => [
            'name_en'  => 'Saoud Al-Ghamdi',
            'name_ar'  => 'سعود الغامدي',
            'cdn_path' => 'saud_alghamdi',
            'bio'      => 'Saudi reciter, former imam at Masjid Al-Haram. Known for his calm and steady recitation.',
        ],
        'dosari' => [
            'name_en'  => 'Yasser Al-Dosari',
            'name_ar'  => 'ياسر الدوسري',
            'cdn_path' => 'yasser_aldosari',
            'bio'      => 'Saudi reciter and current imam of Masjid Al-Haram. Known for his strong and emotional voice.',
        ],
        'sudais' => [
            'name_en'  => 'Abdul Rahman Al-Sudais',
            'name_ar'  => 'عبد الرحمن السديس',
            'cdn_path' => 'abdulrahman_alsudais',
            'bio'      => 'Saudi reciter and chief imam of Masjid Al-Haram. Known for his distinctive and powerful voice.',
        ],
        'maher' => [
            'name_en'  => 'Maher Al-Muaiqly',
            'name_ar'  => 'ماهر المعيقلي',
            'cdn_path' => 'maher_al_mueaqly',
            'bio'      => 'Saudi reciter and imam at Masjid Al-Haram. Known for his melodious and clear recitation.',
        ],
        'mohamed_ayyoub' => [
            'name_en'  => 'Mohamed Ayyoub',
            'name_ar'  => 'محمد أيوب',
            'cdn_path' => 'mohammad_ayyoub',
            'bio'      => 'Saudi reciter and former imam of Masjid Al-Nabawi in Madinah.',
        ],
        'salem_shareef' => [
            'name_en'  => 'Salem Al-Shareef',
            'name_ar'  => 'سالم الشريف',
            'cdn_path' => 'salem_alshareef',
            'bio'      => 'Saudi reciter known for his beautiful and emotional recitation style.',
        ],
        'abdul_wadood' => [
            'name_en'  => 'Abdul Wadood Haneef',
            'name_ar'  => 'عبد الودود حنيف',
            'cdn_path' => 'abdul_wadood_haneef',
            'bio'      => 'Prominent reciter from India, known for his clear voice and precise tajweed.',
        ],
        'salah_budair' => [
            'name_en'  => 'Salah Al-Budair',
            'name_ar'  => 'صلاح البدير',
            'cdn_path' => 'salah_al_budair',
            'bio'      => 'Saudi reciter and imam at Masjid Al-Nabawi in Madinah. Known for his powerful voice.',
        ],
    ];

    public function run(): void
    {
        set_time_limit(0);

        $this->command->info('');
        $this->command->info('╔══════════════════════════════════════════╗');
        $this->command->info('║   SEEDING 15 RECITERS (records only)    ║');
        $this->command->info('╚══════════════════════════════════════════╝');
        $this->command->info('Audio files are NOT downloaded here.');
        $this->command->info('Run: php artisan quran:localize-audio --reciter_id=X');
        $this->command->info('');

        $inserted = 0;
        $skipped  = 0;

        foreach (self::RECITERS as $key => $data) {
            $reciter = Reciter::where('name->en', $data['name_en'])->first();

            if (! $reciter) {
                $reciter = Reciter::create([
                    'name'      => ['en' => $data['name_en'], 'ar' => $data['name_ar']],
                    'bio'       => ['en' => $data['bio']],
                    'is_active' => true,
                ]);
            }

            // Count existing (including soft-deleted) to avoid unique constraint issues
            $existing = Recitation::withTrashed()
                ->where('reciter_id', $reciter->id)
                ->count();

            if ($existing >= 114) {
                $this->command->line("  <fg=yellow>SKIP</> {$data['name_en']} — {$existing} recitations already exist (ID {$reciter->id})");
                $skipped++;
                continue;
            }

            $this->command->line("  <fg=green>SEED</> {$data['name_en']} (ID {$reciter->id})");

            // Build rows — use a locally downloaded file if it exists, else fall back to CDN URL.
            // Files can be downloaded later with: php artisan quran:localize-audio --reciter_id={$reciter->id}
            $rows = [];
            $now  = now();

            for ($surahId = 1; $surahId <= 114; $surahId++) {
                $localPath = "audio/reciter_{$reciter->id}/surah_{$surahId}.mp3";
                $cdnUrl    = self::CDN_BASE . '/' . $data['cdn_path'] . '/' . str_pad($surahId, 3, '0', STR_PAD_LEFT) . '.mp3';

                $rows[] = [
                    'reciter_id'       => $reciter->id,
                    'surah_id'         => $surahId,
                    'audio_path'       => Storage::disk('public')->exists($localPath) ? $localPath : $cdnUrl,
                    'duration_seconds' => null,
                    'created_at'       => $now,
                    'updated_at'       => $now,
                ];
            }

            DB::transaction(function () use ($rows) {
                foreach (array_chunk($rows, 30) as $chunk) {
                    Recitation::insert($chunk);
                }
            });

            $localCount = collect($rows)->filter(fn($r) => !str_starts_with($r['audio_path'], 'http'))->count();
            $cdnCount   = 114 - $localCount;

            $this->command->line("         ✓ 114 records inserted ({$localCount} local files, {$cdnCount} CDN URLs)");
            $inserted++;
        }

        $this->command->info('');
        $this->command->info('══════════════════════════════════════════════');
        $this->command->info("Done.  Seeded: {$inserted}  |  Skipped: {$skipped}");
        $this->command->info('');
        $this->command->info('To download audio files locally, run per reciter:');
        $this->command->info('  php artisan quran:localize-audio --reciter_id=<id>');
        $this->command->info('Or download all at once:');
        $this->command->info('  php artisan quran:localize-audio');
        $this->command->info('══════════════════════════════════════════════');
    }
}
