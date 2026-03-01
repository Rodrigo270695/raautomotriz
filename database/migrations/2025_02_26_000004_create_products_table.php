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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->decimal('sale_price', 12, 2)->default(0);
            $table->decimal('purchase_price', 12, 2)->default(0);
            $table->unsignedInteger('stock')->default(0);
            $table->string('image')->nullable();
            $table->foreignId('inventory_brand_id')->constrained('inventory_brands')->cascadeOnDelete();
            $table->string('status', 20)->default('active');
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
