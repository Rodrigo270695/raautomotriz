<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_sends', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promotion_id')->constrained('promotions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('sent_whatsapp')->default(false);
            $table->boolean('sent_email')->default(false);
            $table->timestamp('sent_at')->useCurrent();
            $table->unique(['promotion_id', 'user_id']); // evita duplicados
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_sends');
    }
};
