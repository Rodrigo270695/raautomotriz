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
        // Registro de mensajes SORA (asistente vehicular con IA): notificaciones personalizadas generadas con ChatGPT (ej. "Soy SORA, según tu uso te sugiero el cambio de aceite"). Se guarda el mensaje y opcionalmente el prompt para auditoría.
        Schema::create('sora_notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete(); // Vehículo del que se habla
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Cliente destinatario
            $table->foreignId('maintenance_alert_id')->nullable()->constrained('maintenance_alerts')->nullOnDelete(); // Alerta que originó el mensaje (si aplica)
            $table->string('channel', 20); // whatsapp | email
            $table->text('message_sent'); // Texto que recibió el cliente (generado por IA)
            $table->text('prompt_used')->nullable(); // Prompt enviado a ChatGPT (auditoría y debugging)
            $table->timestamp('sent_at')->nullable(); // Cuándo se envió
            $table->string('status', 20)->default('pending'); // pending | sent | failed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sora_notification_logs');
    }
};
