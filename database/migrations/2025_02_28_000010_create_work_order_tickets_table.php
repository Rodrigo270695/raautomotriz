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
        // Ticket de entrega impreso al recoger el vehículo: fecha/hora ingreso, diagnóstico, servicios realizados. Opcional token para verificación.
        Schema::create('work_order_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete(); // Orden a la que corresponde el ticket
            $table->timestamp('printed_at')->nullable(); // Cuándo se imprimió el ticket
            $table->foreignId('printed_by')->nullable()->constrained('users')->nullOnDelete(); // Usuario que imprimió
            $table->string('token', 64)->nullable()->unique(); // Código o token único del ticket (para validación/QR)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_tickets');
    }
};
