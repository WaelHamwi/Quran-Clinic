<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('service_type');
            $table->unsignedBigInteger('service_id')->nullable();
            $table->boolean('was_beneficial')->nullable();
            $table->json('likes')->nullable();
            $table->json('dislikes')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->index(['service_type', 'service_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
