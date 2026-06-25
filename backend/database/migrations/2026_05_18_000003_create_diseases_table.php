<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diseases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subcategory_id')->nullable()->constrained('subcategories')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->cascadeOnDelete();
            $table->json('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // FULLTEXT search support (opt-in via SEARCH_USE_FULLTEXT). MySQL/MariaDB cannot
        // FULLTEXT-index a JSON column directly, so we project the localized names into
        // STORED generated columns and index those. Guarded to MySQL/MariaDB — SQLite
        // (tests) and other drivers skip this and the repository falls back to LIKE.
        if (in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE diseases ADD COLUMN name_ar VARCHAR(512) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(name, '$.ar'))) STORED");
            DB::statement("ALTER TABLE diseases ADD COLUMN name_en VARCHAR(512) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(name, '$.en'))) STORED");
            DB::statement('ALTER TABLE diseases ADD FULLTEXT diseases_name_fulltext (name_ar, name_en)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('diseases');
    }
};
