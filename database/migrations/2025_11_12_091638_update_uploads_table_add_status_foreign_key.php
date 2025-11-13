<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('uploads', function (Blueprint $table) {
            // Drop the old status enum column
            $table->dropColumn('status');
        });

        Schema::table('uploads', function (Blueprint $table) {
            // Add the new status_id foreign key column
            $table->foreignId('status_id')->default(1)->constrained('statuses')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('uploads', function (Blueprint $table) {
            // Drop the foreign key and column
            $table->dropForeign(['status_id']);
            $table->dropColumn('status_id');
        });

        Schema::table('uploads', function (Blueprint $table) {
            // Restore the old status enum column
            $table->enum('status', ['uploaded', 'processing', 'completed'])->default('uploaded');
        });
    }
};
