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
