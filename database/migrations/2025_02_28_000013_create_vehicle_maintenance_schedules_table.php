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
        // Calendario de mantenimiento por vehículo: intervalo en km o días, último servicio y próximo vencimiento. Se actualiza al cerrar una orden con ese paquete/tipo. Jobs revisan aquí para generar alertas.
        Schema::create('vehicle_maintenance_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete(); // Vehículo al que aplica este calendario
            $table->foreignId('service_package_id')->nullable()->constrained('service_packages')->nullOnDelete(); // Paquete (ej. cambio de aceite cada 5000 km)
            $table->foreignId('service_type_id')->nullable()->constrained('service_types')->nullOnDelete(); // Tipo de servicio (si no se usa paquete)
            $table->unsignedInteger('interval_km')->nullable(); // Cada cuántos km debe repetirse (ej. 5000)
            $table->unsignedInteger('interval_days')->nullable(); // Cada cuántos días (alternativa o complemento)
            $table->foreignId('last_work_order_id')->nullable()->constrained('work_orders')->nullOnDelete(); // Última orden donde se hizo este servicio
            $table->timestamp('last_service_at')->nullable(); // Fecha del último servicio
            $table->unsignedInteger('last_service_mileage')->nullable(); // Kilometraje en el último servicio
            $table->unsignedInteger('next_due_km')->nullable(); // Próximo kilometraje debido (para alertas)
            $table->date('next_due_date')->nullable(); // Próxima fecha debido (para alertas por tiempo)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_maintenance_schedules');
    }
};
