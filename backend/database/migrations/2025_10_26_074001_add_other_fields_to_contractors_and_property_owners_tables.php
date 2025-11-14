<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add contractor_type_other column to contractors table
        Schema::table('contractors', function (Blueprint $table) {
            $table->string('contractor_type_other', 200)->nullable()->after('type_id');
        });

        // Add occupation_other column to property_owners table
        Schema::table('property_owners', function (Blueprint $table) {
            $table->string('occupation_other', 200)->nullable()->after('occupation_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contractors', function (Blueprint $table) {
            $table->dropColumn('contractor_type_other');
        });

        Schema::table('property_owners', function (Blueprint $table) {
            $table->dropColumn('occupation_other');
        });
    }
};
