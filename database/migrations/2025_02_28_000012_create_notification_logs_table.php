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
        // Registro de mensajes enviados al cliente por WhatsApp o email (texto, documentos PDF, imágenes). Auditoría y reintentos.
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->nullOnDelete(); // Orden relacionada (si aplica)
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Destinatario (cliente)
            $table->string('channel', 20); // whatsapp | email
            $table->string('subject')->nullable(); // Asunto (email)
            $table->text('message'); // Contenido del mensaje enviado
            $table->json('attachments')->nullable(); // Rutas de archivos enviados: PDF, imágenes. Ej: ["tickets/orden_123.pdf", "fotos/vehiculo.jpg"]
            $table->timestamp('sent_at')->nullable(); // Cuándo se envió realmente
            $table->string('status', 20)->default('pending'); // pending | sent | failed
            $table->text('error_message')->nullable(); // Motivo del fallo (si status = failed)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // maintenance_alerts tiene FK a notification_logs; hay que soltarla antes para que el rollback no falle según el orden de ejecución.
        if (Schema::hasTable('maintenance_alerts')) {
            Schema::table('maintenance_alerts', function (Blueprint $table) {
                $table->dropForeign(['notification_log_id']);
            });
        }
        Schema::dropIfExists('notification_logs');
    }
};
