<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * - Agrega stock_deducted_at: solo cuando está rellenado se consideró el producto "usado" y se descontó del inventario.
     * - Reemplaza triggers: el descuento NO se hace al insertar; se hace desde la app al "guardar" (generar ticket).
     *   DELETE solo restaura stock si la línea tenía stock_deducted_at (ya se había descontado).
     */
    public function up(): void
    {
        Schema::table('work_order_services', function (Blueprint $table) {
            $table->timestamp('stock_deducted_at')->nullable()->after('subtotal');
        });

        $driver = DB::getDriverName();
        if ($driver !== 'mysql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_insert');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_update');

        // INSERT: no descontar aquí; el descuento lo hace la app al generar el ticket.
        DB::unprepared("
            CREATE TRIGGER tr_work_order_services_after_insert
            AFTER INSERT ON work_order_services
            FOR EACH ROW
            BEGIN
                SET @_ = NULL;
            END
        ");

        // DELETE: restaurar stock solo si ya se había descontado (stock_deducted_at no nulo).
        DB::unprepared("
            CREATE TRIGGER tr_work_order_services_after_delete
            AFTER DELETE ON work_order_services
            FOR EACH ROW
            BEGIN
                IF OLD.product_id IS NOT NULL AND OLD.quantity > 0 AND OLD.stock_deducted_at IS NOT NULL THEN
                    UPDATE products
                    SET stock = stock + OLD.quantity
                    WHERE id = OLD.product_id;
                END IF;
            END
        ");

        // UPDATE: si la línea ya tenía stock descontado, ajustar (restaurar viejo, descontar nuevo).
        DB::unprepared("
            CREATE TRIGGER tr_work_order_services_after_update
            AFTER UPDATE ON work_order_services
            FOR EACH ROW
            BEGIN
                IF OLD.stock_deducted_at IS NOT NULL THEN
                    IF OLD.product_id IS NOT NULL AND OLD.quantity > 0 THEN
                        UPDATE products SET stock = stock + OLD.quantity WHERE id = OLD.product_id;
                    END IF;
                    IF NEW.product_id IS NOT NULL AND NEW.quantity > 0 THEN
                        UPDATE products
                        SET stock = GREATEST(0, stock - NEW.quantity)
                        WHERE id = NEW.product_id;
                    END IF;
                END IF;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_insert');
            DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_delete');
            DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_update');
        }

        Schema::table('work_order_services', function (Blueprint $table) {
            $table->dropColumn('stock_deducted_at');
        });
    }
};
