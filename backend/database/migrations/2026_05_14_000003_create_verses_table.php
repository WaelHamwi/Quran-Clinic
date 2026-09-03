<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surah_id')->constrained('surahs')->cascadeOnDelete();
            $table->unsignedSmallInteger('verse_number');
            $table->json('text');
            // Pre-normalized Arabic (no harakat/Quranic signs, unified alef/hamza
            // forms) so search is a plain LIKE instead of two REGEXP_REPLACE calls
            // per row per request. Filled by the seeder and the model's saving hook;
            // existing databases backfill in place via `php artisan verses:normalize`.
            $table->text('text_norm')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['surah_id', 'verse_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verses');
    }
};
