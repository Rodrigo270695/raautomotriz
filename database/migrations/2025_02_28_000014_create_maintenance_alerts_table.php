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
        // Alertas de mantenimiento generadas por el sistema: "ya toca cambio de aceite" (por km o por fecha). Un job revisa vehicle_maintenance_schedules y crea filas aquí; luego se envía WhatsApp/email y se vincula notification_log.
        Schema::create('maintenance_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete(); // Vehículo al que aplica la alerta
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Cliente (dueño) a quien notificar
            $table->foreignId('service_package_id')->nullable()->constrained('service_packages')->nullOnDelete(); // Paquete o servicio sugerido
            $table->foreignId('service_type_id')->nullable()->constrained('service_types')->nullOnDelete();
            $table->string('type', 20); // due_km = vence por kilometraje | due_date = vence por fecha
            $table->timestamp('scheduled_at')->nullable(); // Cuándo se programó/envío la alerta
            $table->timestamp('sent_at')->nullable(); // Cuándo se envió la notificación al cliente
            $table->foreignId('notification_log_id')->nullable()->constrained('notification_logs')->nullOnDelete(); // Mensaje enviado (WhatsApp/email)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_alerts');
    }
};
