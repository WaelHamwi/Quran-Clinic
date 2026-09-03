<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('recordings', 'type')) {
            Schema::table('recordings', function (Blueprint $table) {
                $table->enum('type', ['summarized', 'detailed'])->default('summarized')->after('duration_seconds');
            });
        }

        if (Schema::hasColumn('recordings', 'is_free')) {
            DB::table('recordings')->where('is_free', true)->update(['type' => 'summarized']);
            DB::table('recordings')->where('is_free', false)->update(['type' => 'detailed']);

            Schema::table('recordings', function (Blueprint $table) {
                $table->dropColumn('is_free');
            });
        }

        $this->softDeleteDuplicateTypes();
    }

    public function down(): void
    {
        if (! Schema::hasColumn('recordings', 'is_free')) {
            Schema::table('recordings', function (Blueprint $table) {
                $table->boolean('is_free')->default(false)->after('duration_seconds');
            });

            DB::table('recordings')->where('type', 'summarized')->update(['is_free' => true]);
        }

        if (Schema::hasColumn('recordings', 'type')) {
            Schema::table('recordings', function (Blueprint $table) {
                $table->dropColumn('type');
            });
        }
    }

    private function softDeleteDuplicateTypes(): void
    {
        $rows = DB::table('recordings')
            ->whereNull('deleted_at')
            ->orderBy('session_number')
            ->orderBy('id')
            ->get(['id', 'disease_id', 'subcategory_id', 'category_id', 'type']);

        $seen = [];
        $extraIds = [];

        foreach ($rows as $row) {
            $owner = match (true) {
                (bool) $row->disease_id     => 'd' . $row->disease_id,
                (bool) $row->subcategory_id => 's' . $row->subcategory_id,
                (bool) $row->category_id    => 'c' . $row->category_id,
                default                     => null,
            };

            if ($owner === null) {
                continue;
            }

            $key = $owner . '|' . $row->type;

            if (isset($seen[$key])) {
                $extraIds[] = $row->id;
            } else {
                $seen[$key] = true;
            }
        }

        if ($extraIds !== []) {
            DB::table('recordings')->whereIn('id', $extraIds)->update(['deleted_at' => now()]);
        }
    }
};
