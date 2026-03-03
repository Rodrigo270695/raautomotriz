<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sora_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('sora_conversations')->cascadeOnDelete();
            $table->enum('role', ['user', 'assistant']); // quien envió el mensaje
            $table->text('content');                     // contenido del mensaje
            $table->integer('tokens_used')->nullable();  // tokens consumidos (solo en respuestas de IA)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sora_messages');
    }
};
