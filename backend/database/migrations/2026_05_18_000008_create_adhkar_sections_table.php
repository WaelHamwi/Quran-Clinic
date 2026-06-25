<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adhkar_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adhkar_category_id')->constrained('adhkar_categories')->cascadeOnDelete();
            $table->json('name');
            $table->boolean('order_randomly')->default(false);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adhkar_sections');
    }
};
