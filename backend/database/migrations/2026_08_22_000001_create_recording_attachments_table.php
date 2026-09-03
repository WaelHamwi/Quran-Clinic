<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recording_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recording_id')->constrained('recordings')->cascadeOnDelete();
            $table->string('attachable_type');
            $table->unsignedBigInteger('attachable_id');
            $table->unsignedSmallInteger('session_number')->default(1);
            $table->timestamps();

            $table->unique(['recording_id', 'attachable_type', 'attachable_id'], 'recording_attachments_unique');
            $table->index(['attachable_type', 'attachable_id', 'session_number'], 'recording_attachments_owner_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recording_attachments');
    }
};
