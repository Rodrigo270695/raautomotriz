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
        Schema::create('inventory_brands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_type_id')->constrained('inventory_types')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unique(['inventory_type_id', 'name']);
            $table->string('status', 20)->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_brands');
    }
};
