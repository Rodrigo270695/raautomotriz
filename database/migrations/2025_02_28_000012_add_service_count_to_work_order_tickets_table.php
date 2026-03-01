<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Cantidad de servicios al momento de crear el ticket (para saber si hay cambios y mostrar "Guardar e imprimir" o "Imprimir ticket").
     */
    public function up(): void
    {
        Schema::table('work_order_tickets', function (Blueprint $table) {
            $table->unsignedInteger('service_count')->nullable()->after('token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_order_tickets', function (Blueprint $table) {
            $table->dropColumn('service_count');
        });
    }
};
