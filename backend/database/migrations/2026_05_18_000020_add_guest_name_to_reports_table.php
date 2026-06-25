<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Dedicated additive migration: the `reports` table is already live on production,
// so the column is added in place rather than amending the original migration
// (migrate:fresh would drop production data).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            // Name a guest optionally types so admins can identify anonymous reporters.
            $table->string('guest_name')->nullable()->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn('guest_name');
        });
    }
};
