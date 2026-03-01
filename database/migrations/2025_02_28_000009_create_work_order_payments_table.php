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
        // Pagos de la orden: adelanto, abonos parciales y pago final. Si total_amount - SUM(amount) > 0 el cliente queda fiado (cuenta por pagar).
        Schema::create('work_order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete(); // Orden que se paga
            $table->string('type', 20); // advance = adelanto | partial = abono | final = pago final
            $table->decimal('amount', 12, 2); // Monto del pago
            $table->string('payment_method', 40)->nullable(); // Efectivo, transferencia, tarjeta, etc.
            $table->timestamp('paid_at')->nullable(); // Fecha y hora del pago
            $table->string('reference')->nullable(); // Número de operación, voucher, etc.
            $table->text('notes')->nullable(); // Notas del pago
            $table->timestamps();
        }); 
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_payments');
    }
};
