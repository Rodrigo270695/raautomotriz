<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('title');                          // Título de la promoción
            $table->text('description')->nullable();          // Descripción / texto del mensaje
            $table->string('image_path')->nullable();         // Ruta de la imagen subida
            $table->boolean('is_active')->default(false);     // Si se muestra en la web (modal)
            $table->boolean('notifications_sent')->default(false); // Si ya se envió a clientes
            $table->timestamp('notifications_sent_at')->nullable(); // Cuándo se envió
            $table->timestamp('starts_at')->nullable();       // Fecha de inicio (opcional)
            $table->timestamp('ends_at')->nullable();         // Fecha de fin (opcional)
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
