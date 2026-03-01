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
        // Paquetes de servicio (catálogo fijo): ej. "Preventivo – Cambio de aceite", "Correctivo – Frenos". Agrupa tipo de servicio + productos por defecto. No se edita al aplicarlo a una orden.
        Schema::create('service_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre del paquete (ej. "Preventivo – Cambio de aceite")
            $table->text('description')->nullable(); // Descripción del paquete
            $table->foreignId('service_type_id')->constrained('service_types')->cascadeOnDelete(); // Tipo (preventivo, correctivo, etc.)
            $table->string('status', 20)->default('active'); // active | inactive
            $table->unsignedSmallInteger('sort_order')->default(0); // Orden de aparición en listados
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_packages');
    }
};
