<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds `waking_delay_minutes` to databases that already exist and therefore
 * cannot be rebuilt with migrate:fresh — production above all.
 *
 * The column is also declared in the original create migration, so a freshly
 * migrated database already has it; the hasColumn guards make this migration a
 * no-op there instead of failing on a duplicate column.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('notification_preferences', 'waking_delay_minutes')) {
            return;
        }

        Schema::table('notification_preferences', function (Blueprint $table) {
            $table->unsignedTinyInteger('waking_delay_minutes')
                ->default(0)
                ->after('waking_end_time');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('notification_preferences', 'waking_delay_minutes')) {
            return;
        }

        Schema::table('notification_preferences', function (Blueprint $table) {
            $table->dropColumn('waking_delay_minutes');
        });
    }
};
