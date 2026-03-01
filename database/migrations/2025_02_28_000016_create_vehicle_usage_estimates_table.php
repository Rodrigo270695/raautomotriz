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
        // Estimado de uso y próximo servicio: resultado del cálculo o IA (km/día, próximo km y fecha de mantenimiento). Se alimenta con vehicle_usage_surveys e historial de órdenes.
        Schema::create('vehicle_usage_estimates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete(); // Vehículo estimado
            $table->unsignedInteger('estimated_km_per_day')->nullable(); // Km/día estimados según encuesta e historial
            $table->unsignedInteger('next_service_km')->nullable(); // Próximo kilometraje en que se sugiere el servicio
            $table->date('next_service_date')->nullable(); // Fecha aproximada de próximo servicio
            $table->foreignId('service_package_id')->nullable()->constrained('service_packages')->nullOnDelete(); // Paquete o tipo de servicio al que aplica
            $table->foreignId('service_type_id')->nullable()->constrained('service_types')->nullOnDelete();
            $table->timestamp('last_calculated_at')->nullable(); // Última vez que se recalculó
            $table->string('source', 20)->nullable(); // manual = ingresado por usuario | ai = calculado/IA
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_usage_estimates');
    }
};
