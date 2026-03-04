<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sora_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('sora_conversations')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('guest_name', 150)->nullable();
            $table->string('guest_phone', 30)->nullable();

            $table->string('vehicle_brand', 100)->nullable();
            $table->string('vehicle_model', 100)->nullable();
            $table->string('vehicle_plate', 20)->nullable();

            $table->dateTime('scheduled_at');
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sora_appointments');
    }
};

