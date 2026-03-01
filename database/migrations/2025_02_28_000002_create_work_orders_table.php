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
        // Orden de trabajo: eje del proceso. Registra ingreso del vehículo, cliente, kilometraje, diagnóstico, estado y montos (total, adelanto). El cliente (client_id) es un user.
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete(); // Vehículo que ingresa al taller
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete(); // Cliente (usuario) dueño del vehículo
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); // Usuario del sistema que creó la orden (recepción)
            $table->date('entry_date'); // Fecha de ingreso del vehículo
            $table->time('entry_time'); // Hora de ingreso
            $table->unsignedInteger('entry_mileage')->nullable(); // Kilometraje al ingreso (para historial y alertas de mantenimiento)
            $table->unsignedInteger('exit_mileage')->nullable(); // Kilometraje al entregar (opcional)
            $table->text('client_observation')->nullable(); // Observación del cliente (qué le pasa al carro, ruidos, etc.)
            $table->text('diagnosis')->nullable(); // Diagnóstico técnico (texto o se usa work_order_diagnoses para historial)
            $table->string('status', 40)->default('ingreso'); // ingreso | en_checklist | diagnosticado | en_reparacion | listo_para_entregar | entregado | cancelado
            $table->decimal('advance_payment_amount', 12, 2)->default(0); // Monto de adelanto pagado por el cliente
            $table->decimal('total_amount', 12, 2)->default(0); // Total de la orden (servicios + productos). Si total - pagos > 0 → cliente fiado
            $table->text('notes')->nullable(); // Notas internas del taller
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
