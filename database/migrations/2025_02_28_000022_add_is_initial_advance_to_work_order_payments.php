<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Marca el pago como "adelanto inicial" (el que se registra al crear/editar la orden).
     * Solo puede haber uno por orden; se usa para sincronizar work_orders.advance_payment_amount.
     */
    public function up(): void
    {
        Schema::table('work_order_payments', function (Blueprint $table) {
            $table->boolean('is_initial_advance')->default(false)->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_order_payments', function (Blueprint $table) {
            $table->dropColumn('is_initial_advance');
        });
    }
};
