<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsor_screen_config', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_enabled')->default(true);
            $table->unsignedInteger('display_duration_seconds')->default(3);
            $table->foreignId('selected_sponsor_id')->nullable()->constrained('sponsors')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsor_screen_config');
    }
};
