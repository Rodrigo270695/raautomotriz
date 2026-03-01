<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Añade el número de orden a la plantilla de lista de chequeo (obligatorio, único). Orden de aparición en listados.
     */
    public function up(): void
    {
        Schema::table('service_checklists', function (Blueprint $table) {
            $table->unsignedSmallInteger('order_number')->default(1)->after('id'); // Número de orden (obligatorio, único)
        });

        // Rellenar filas existentes con id como order_number para que sean únicas antes de añadir el índice unique
        DB::table('service_checklists')->update(['order_number' => DB::raw('id')]);

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
            $table->dropColumn('order_number');
        });
    }
};
