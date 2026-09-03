<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favorite_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('kind', ['category', 'subcategory']);
            $table->unsignedBigInteger('node_id');
            $table->timestamps();
            $table->unique(['user_id', 'kind', 'node_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorite_nodes');
    }
};
