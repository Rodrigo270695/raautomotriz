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
        // Diagnóstico formal de la orden: texto del diagnóstico, quién lo realizó y cuándo. Permite historial si hay varios diagnósticos por orden.
        Schema::create('work_order_diagnoses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete(); // Orden diagnosticada
            $table->text('diagnosis_text'); // Contenido del diagnóstico (falla, piezas, recomendación)
            $table->foreignId('diagnosed_by')->nullable()->constrained('users')->nullOnDelete(); // Mecánico o técnico que diagnosticó
            $table->timestamp('diagnosed_at')->nullable(); // Fecha y hora del diagnóstico
            $table->text('internal_notes')->nullable(); // Notas internas no visibles para el cliente
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_diagnoses');
    }
};
