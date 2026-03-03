<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sora_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('session_id')->nullable()->index(); // para usuarios no registrados
            $table->string('vehicle_plate')->nullable();       // placa que mencionó el cliente
            $table->text('problem_summary')->nullable();       // resumen del problema generado por IA
            $table->json('preliminary_diagnoses')->nullable(); // posibles diagnósticos sugeridos
            $table->enum('status', ['active', 'closed', 'escalated'])->default('active');
            // escalated = la IA derivó al taller
            $table->timestamp('escalated_at')->nullable();     // cuando la IA dijo "ve al taller"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sora_conversations');
    }
};
