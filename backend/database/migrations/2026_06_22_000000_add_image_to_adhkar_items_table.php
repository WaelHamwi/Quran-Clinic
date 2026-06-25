<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Additive migration for production. Fresh installs already get `image` from the
 * create_adhkar_items migration, so this is guarded with hasColumn() and becomes a
 * no-op there. On existing databases (production) it adds the missing column.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('adhkar_items', 'image')) {
            Schema::table('adhkar_items', function (Blueprint $table) {
                $table->string('image')->nullable()->after('text');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('adhkar_items', 'image')) {
            Schema::table('adhkar_items', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }
    }
};
