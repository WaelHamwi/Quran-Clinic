<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the detail-screen content fields to an ALREADY-migrated courses table
 * (production). The create_courses migration also declares these columns for
 * fresh installs, so every add here is guarded by hasColumn() — on a fresh DB
 * the columns already exist and this migration is a safe no-op. On production
 * `php artisan migrate --force` runs only this new file, backfilling the
 * columns without touching existing rows. Never migrate:fresh on production.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (! Schema::hasColumn('courses', 'target_audience')) {
                $table->json('target_audience')->nullable()->after('description');
            }
            if (! Schema::hasColumn('courses', 'course_topics')) {
                $table->json('course_topics')->nullable()->after('target_audience');
            }
            if (! Schema::hasColumn('courses', 'registration_info')) {
                $table->json('registration_info')->nullable()->after('course_topics');
            }
            if (! Schema::hasColumn('courses', 'image_url')) {
                $table->string('image_url')->nullable()->after('start_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            foreach (['target_audience', 'course_topics', 'registration_info', 'image_url'] as $column) {
                if (Schema::hasColumn('courses', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
