<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * order_number nullable: cuando un registro se deshabilita (inactive) se pone null;
     * solo los activos tienen 1, 2, 3... y se renumeran al deshabilitar/habilitar.
     */
    public function up(): void
    {
        Schema::table('service_checklists', function (Blueprint $table) {
            $table->dropUnique(['order_number']);
        });

        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE service_checklists MODIFY order_number SMALLINT UNSIGNED NULL');
        } else {
            Schema::table('service_checklists', function (Blueprint $table) {
                $table->unsignedSmallInteger('order_number')->nullable()->change();
            });
        }

        Schema::table('service_checklists', function (Blueprint $table) {
            $table->unique('order_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_checklists', function (Blueprint $table) {
            $table->dropUnique(['order_number']);
        });

        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE service_checklists MODIFY order_number SMALLINT UNSIGNED NOT NULL DEFAULT 1');
        } else {
            Schema::table('service_checklists', function (Blueprint $table) {
                $table->unsignedSmallInteger('order_number')->nullable(false)->default(1)->change();
            });
        }

        Schema::table('service_checklists', function (Blueprint $table) {
            $table->unique('order_number');
        });
    }
};
