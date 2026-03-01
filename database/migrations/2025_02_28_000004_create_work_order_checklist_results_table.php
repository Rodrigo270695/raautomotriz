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
        // Resultado del checklist aplicado a una orden: se guarda si la lista fue revisada (OK/falla) y nota. Solo lista de chequeo, sin ítems.
        Schema::create('work_order_checklist_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete(); // Orden en la que se aplicó la lista
            $table->foreignId('service_checklist_id')->constrained('service_checklists')->cascadeOnDelete(); // Lista de chequeo usada
            $table->boolean('checked')->default(false); // true = OK / revisado, false = no aplica o falla
            $table->text('note')->nullable(); // Observación del técnico para este ítem
            $table->timestamp('completed_at')->nullable(); // Cuándo se marcó este resultado
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete(); // Usuario que marcó (técnico/recepción)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_checklist_results');
    }
};
