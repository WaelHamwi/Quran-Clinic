<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->boolean('adhkar_morning_enabled')->default(true);
            $table->boolean('adhkar_evening_enabled')->default(true);
            $table->boolean('adhkar_sleep_enabled')->default(true);
            $table->boolean('adhkar_waking_enabled')->default(true);
            $table->time('waking_start_time')->nullable();
            $table->time('waking_end_time')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
