<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reciter_id')->constrained('reciters')->cascadeOnDelete();
            $table->foreignId('surah_id')->constrained('surahs')->cascadeOnDelete();
            $table->string('audio_path', 500);
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['reciter_id', 'surah_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recitations');
    }
};
