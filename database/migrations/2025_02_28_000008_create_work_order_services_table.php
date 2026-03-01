<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Servicios/productos aplicados a una orden. Se copian del paquete al "jalar" el paquete; luego solo aquí se puede añadir o quitar líneas para esa orden. Si product_id no es null, un trigger descuenta stock en products.
     */
    public function up(): void
    {
        Schema::create('work_order_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete(); // Orden a la que pertenece esta línea
            $table->foreignId('service_package_id')->nullable()->constrained('service_packages')->nullOnDelete(); // Paquete del que provino (si aplica)
            $table->foreignId('service_package_item_id')->nullable()->constrained('service_package_items')->nullOnDelete(); // Ítem del paquete (si aplica)
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete(); // Producto usado; al insertar/actualizar se descuenta stock en products
            $table->string('description')->nullable(); // Descripción libre de la línea (ej. "Cambio de aceite 5W30")
            $table->decimal('quantity', 10, 2)->unsigned()->default(1); // Cantidad; con product_id el trigger usa este valor para descontar
            $table->decimal('unit_price', 12, 2)->default(0); // Precio unitario aplicado en esta orden
            $table->decimal('subtotal', 12, 2)->default(0); // quantity * unit_price (para facturación y ticket)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_services');
    }
};
