<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Resumen de cuentas por cobrar (fiado) por cliente: total que debe cada cliente. Caché recalculable con sp_recalc_client_balance o sp_recalc_all_client_balances (vista v_work_order_balances).
     */
    public function up(): void
    {
        Schema::create('client_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete(); // Cliente (user) al que pertenece el saldo
            $table->decimal('total_pending', 12, 2)->default(0); // Suma de saldos pendientes de todas sus órdenes (total_amount - pagos)
            $table->timestamp('last_updated')->nullable(); // Última vez que se recalculó este registro
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_balances');
    }
};
