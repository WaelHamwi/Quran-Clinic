<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recordings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disease_id')->nullable()->constrained('diseases')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->cascadeOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('subcategories')->cascadeOnDelete();
            $table->unsignedSmallInteger('session_number')->default(1);
            $table->json('description')->nullable();
            $table->json('segments')->nullable();
            $table->string('audio_path', 500)->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->boolean('is_free')->default(false);
            $table->boolean('is_general')->default(false);
            $table->unsignedInteger('plays_count')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['disease_id', 'session_number']);
            $table->index(['category_id', 'session_number']);
            $table->index(['subcategory_id', 'session_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recordings');
    }
};
