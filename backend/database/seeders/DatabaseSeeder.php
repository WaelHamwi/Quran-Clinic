<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ── 1. Roles ─────────────────────────────────────────────────
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

        // ── 2. Super-admin account ────────────────────────────────────
        //    Dashboard login → admin@quran.local  /  Admin@1234
        $admin = User::firstOrCreate(
            ['email' => 'admin@quran.local'],
            [
                'name'              => 'Admin',
                'email_verified_at' => now(),
                'password'          => bcrypt('Admin@1234'),
            ]
        );
        $admin->syncRoles($superAdminRole);

        // ── 3. Regular test user (for API testing while auth is bypassed)
        //    API login → user@quran.local  /  User@1234
        $testUser = User::firstOrCreate(
            ['email' => 'user@quran.local'],
            [
                'name'              => 'Test User',
                'email_verified_at' => now(),
                'country'           => 'Saudi Arabia',
                'gender'            => 'male',
                'password'          => bcrypt('User@1234'),
            ]
        );
        $testUser->syncRoles($userRole);

        // ── 4. Domain data ────────────────────────────────────────────
        $this->call([
            QuranSeeder::class,
            TranslationSeeder::class,
            RecitationSeeder::class,
            FeatureFlagSeeder::class,
            CategorySeeder::class,
            AdhkarSeeder::class,
            TahsinatSeeder::class,
            SponsorSeeder::class,
            CourseSeeder::class,
        ]);

        // ── 5. Compress any local audio already on disk ───────────────
        //    Skips CDN URLs automatically. Safe to run on every seed.
        Artisan::call('audio:compress', ['--sync' => true]);
        $this->command->line(Artisan::output());
    }
}
