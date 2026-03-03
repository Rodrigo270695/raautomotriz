<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_packages', function (Blueprint $table) {
            // Intervalo de repetición para recordatorios de mantenimiento
            $table->unsignedInteger('interval_km')->nullable()->after('sort_order')
                ->comment('Cada cuántos km debe repetirse este servicio (ej. 5000)');
            $table->unsignedSmallInteger('interval_days')->nullable()->after('interval_km')
                ->comment('Cada cuántos días debe repetirse (ej. 90)');
        });
    }

    public function down(): void
    {
        Schema::table('service_packages', function (Blueprint $table) {
            $table->dropColumn(['interval_km', 'interval_days']);
        });
    }
};
