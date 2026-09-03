<?php

use App\Models\Subcategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Until now a subcategory's kind was inferred from what it happened to hold —
 * diseases, or recordings attached directly. A freshly created one holds
 * neither, so the CMS could not tell which it was meant to be and offered the
 * recording picker on every new subcategory. This makes the choice explicit,
 * the way `categories.type` already does.
 *
 * Existing rows are backfilled from what they actually hold, so nothing
 * changes for them.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subcategories', function (Blueprint $table) {
            $table->string('type')->default(Subcategory::TYPE_STANDARD)->after('slug');
        });

        DB::table('subcategories')
            ->whereIn('id', function ($query): void {
                $query->select('attachable_id')
                    ->from('recording_attachments')
                    ->where('attachable_type', Subcategory::class);
            })
            ->update(['type' => Subcategory::TYPE_DIRECT]);
    }

    public function down(): void
    {
        Schema::table('subcategories', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
