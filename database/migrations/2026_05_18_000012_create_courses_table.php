<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->json('title');
            $table->json('description')->nullable();
            $table->json('target_audience')->nullable();    // "لمن هذه الدورة؟" body — translatable
            $table->json('course_topics')->nullable();       // "محاور الدورة" — translatable, newline = bullet
            $table->json('registration_info')->nullable();   // "معلومات التقديم" — translatable, newline = bullet
            $table->string('instructor_name')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->date('start_date')->nullable();
            $table->string('image_url')->nullable();          // cover image shown on card + detail header
            $table->string('whatsapp_link')->nullable();
            $table->boolean('is_coming_soon')->default(true);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
