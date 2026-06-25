<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disease_aliases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disease_id')->constrained('diseases')->cascadeOnDelete();
            $table->json('alias');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disease_aliases');
    }
};
