<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsors', function (Blueprint $table) {
            $table->id();
            $table->json('name');
            $table->string('logo_path', 500)->nullable();
            $table->string('website_url')->nullable();
            $table->boolean('target_all_countries')->default(true);
            $table->json('target_countries')->nullable();
            $table->json('target_genders')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('display_on_launch')->default(false);
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsors');
    }
};
