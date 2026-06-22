<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adhkar_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adhkar_category_id')->constrained('adhkar_categories')->cascadeOnDelete();
            $table->foreignId('adhkar_section_id')->nullable()->constrained('adhkar_sections')->nullOnDelete();
            $table->json('text')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('repetitions')->default(1);
            $table->json('hint')->nullable();
            $table->json('daleel')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adhkar_items');
    }
};
