<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tahsinat_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tahsinat_category_id')->constrained('tahsinat_categories')->cascadeOnDelete();
            $table->foreignId('tahsinat_section_id')->nullable()->constrained('tahsinat_sections')->nullOnDelete();
            $table->json('label')->nullable();
            $table->json('text')->nullable();
            $table->unsignedInteger('repetitions')->default(1);
            $table->json('hint')->nullable();
            $table->string('applicability')->default('both');
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tahsinat_items');
    }
};
