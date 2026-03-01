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
        // Fotos y videos de la orden: ingreso del vehículo, diagnóstico, proceso de reparación y entrega. El cliente puede verlas en el seguimiento.
        Schema::create('work_order_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete(); // Orden a la que pertenece la foto
            $table->string('type', 20); // entry = ingreso | diagnosis = diagnóstico | process = avance/reparación | delivery = entrega
            $table->string('path'); // Ruta del archivo (storage o URL)
            $table->string('caption')->nullable(); // Pie de foto o descripción opcional
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_photos');
    }
};
