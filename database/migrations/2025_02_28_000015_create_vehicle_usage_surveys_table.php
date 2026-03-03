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
        // Encuesta de uso del vehículo (para SORA): el técnico pregunta al cliente frecuencia, ruta, viajes/día, etc. Sirve para estimar km/día y personalizar notificaciones con IA.
        Schema::create('vehicle_usage_surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete(); // Vehículo del que se recoge el uso
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Cliente que responde
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->nullOnDelete(); // Orden en la que se capturó (si aplica)
            $table->unsignedSmallInteger('trips_per_day')->nullable(); // Cuántos viajes hace al día aprox.
            $table->string('daily_use_frequency', 80)->nullable(); // "todos los días", "3 veces por semana", etc.
            $table->string('route_description')->nullable(); // "Casa–oficina 20 km ida y vuelta"
            $table->unsignedInteger('approx_km_per_day')->nullable(); // Km aproximados por día
            $table->unsignedInteger('approx_km_per_week')->nullable(); // Km aproximados por semana
            $table->string('use_type', 20)->nullable(); // ciudad | carretera | mixto
            $table->timestamp('surveyed_at')->nullable(); // Cuándo se realizó la encuesta
            $table->foreignId('surveyed_by')->nullable()->constrained('users')->nullOnDelete(); // Técnico/recepción que la registró
            $table->timestamps();
        }); 
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_usage_surveys');
    }
};
