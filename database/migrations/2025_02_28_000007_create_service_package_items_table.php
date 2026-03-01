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
        // Ítems que lleva cada paquete por defecto (productos y/o servicios con cantidad y precio). Definición fija; al aplicar el paquete a una orden se copian a work_order_services donde sí se puede añadir/quitar.
        Schema::create('service_package_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_package_id')->constrained('service_packages')->cascadeOnDelete(); // Paquete al que pertenece este ítem
            $table->string('type', 20); // service = mano de obra/servicio | product = producto de inventario
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete(); // Producto (si type = product); al usarse en orden se descuenta de inventario
            $table->decimal('quantity', 10, 2)->unsigned()->default(1); // Cantidad (unidades o horas según el caso)
            $table->decimal('unit_price', 12, 2)->default(0); // Precio unitario en el paquete
            $table->text('notes')->nullable(); // Notas del ítem
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_package_items');
    }
};
