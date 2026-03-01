<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Distingue línea de producto (inventario, manual o paquete) vs servicio (manual).
     */
    public function up(): void
    {
        Schema::table('work_order_services', function (Blueprint $table) {
            $table->string('type', 20)->nullable()->after('subtotal')->comment('product|service');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_order_services', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
