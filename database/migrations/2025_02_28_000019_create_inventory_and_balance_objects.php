<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Objetos MySQL (solo si driver = mysql):
     * - Triggers: al insertar/actualizar/eliminar en work_order_services, se actualiza products.stock (descuento o restauración) cuando la línea tiene product_id.
     * - Vista v_work_order_balances: por cada orden no cancelada devuelve work_order_id, user_id (cliente), total_amount, total_paid, balance_pending (para fiado).
     * - sp_recalc_client_balance(p_user_id): actualiza o inserta en client_balances el total_pending de ese cliente usando la vista.
     * - sp_recalc_all_client_balances(): borra client_balances y vuelve a llenar para todos los clientes con balance_pending > 0.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'mysql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_insert');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_update');

        // Trigger: al INSERTAR una línea en work_order_services con product_id, se descuenta quantity del stock del producto (nunca menor a 0).
        DB::unprepared("
            CREATE TRIGGER tr_work_order_services_after_insert
            AFTER INSERT ON work_order_services
            FOR EACH ROW
            BEGIN
                IF NEW.product_id IS NOT NULL AND NEW.quantity > 0 THEN
                    UPDATE products
                    SET stock = GREATEST(0, stock - NEW.quantity)
                    WHERE id = NEW.product_id;
                END IF;
            END
        ");

        // Trigger: al ELIMINAR una línea de work_order_services que tenía product_id, se restaura quantity al stock del producto.
        DB::unprepared("
            CREATE TRIGGER tr_work_order_services_after_delete
            AFTER DELETE ON work_order_services
            FOR EACH ROW
            BEGIN
                IF OLD.product_id IS NOT NULL AND OLD.quantity > 0 THEN
                    UPDATE products
                    SET stock = stock + OLD.quantity
                    WHERE id = OLD.product_id;
                END IF;
            END
        ");

        // Trigger: al ACTUALIZAR work_order_services se restaura la cantidad antigua (OLD) al producto viejo y se descuenta la nueva (NEW) del producto nuevo (permite cambiar producto o cantidad).
        DB::unprepared("
            CREATE TRIGGER tr_work_order_services_after_update
            AFTER UPDATE ON work_order_services
            FOR EACH ROW
            BEGIN
                IF OLD.product_id IS NOT NULL AND OLD.quantity > 0 THEN
                    UPDATE products SET stock = stock + OLD.quantity WHERE id = OLD.product_id;
                END IF;
                IF NEW.product_id IS NOT NULL AND NEW.quantity > 0 THEN
                    UPDATE products
                    SET stock = GREATEST(0, stock - NEW.quantity)
                    WHERE id = NEW.product_id;
                END IF;
            END
        ");

        // Vista: por cada orden (excluye canceladas) devuelve work_order_id, user_id=cliente, total_amount, total_paid (suma de work_order_payments), balance_pending = total - pagos. Usada para reportes de fiado y por sp_recalc_client_balance.
        DB::unprepared("
            CREATE OR REPLACE VIEW v_work_order_balances AS
            SELECT
                wo.id AS work_order_id,
                wo.client_id AS user_id,
                wo.total_amount,
                COALESCE(SUM(wop.amount), 0) AS total_paid,
                (wo.total_amount - COALESCE(SUM(wop.amount), 0)) AS balance_pending
            FROM work_orders wo
            LEFT JOIN work_order_payments wop ON wop.work_order_id = wo.id
            WHERE wo.status NOT IN ('cancelado')
            GROUP BY wo.id, wo.client_id, wo.total_amount
        ");

        // Procedimiento: dado un user_id (cliente), calcula la suma de balance_pending de sus órdenes (vista) e inserta o actualiza client_balances para ese usuario. Útil después de registrar un pago.
        DB::unprepared("
            CREATE PROCEDURE sp_recalc_client_balance(IN p_user_id BIGINT UNSIGNED)
            BEGIN
                SET @tot = (
                    SELECT COALESCE(SUM(balance_pending), 0)
                    FROM v_work_order_balances
                    WHERE user_id = p_user_id AND balance_pending > 0
                );
                INSERT INTO client_balances (user_id, total_pending, last_updated, created_at, updated_at)
                VALUES (p_user_id, COALESCE(@tot, 0), NOW(), NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    total_pending = COALESCE(@tot, 0),
                    last_updated = NOW(),
                    updated_at = NOW();
            END
        ");

        // Procedimiento: vacía client_balances y recorre todos los user_id que tienen balance_pending > 0 en la vista; para cada uno llama sp_recalc_client_balance. Deja la tabla al día con los saldos por cliente (cuentas por cobrar).
        DB::unprepared("
            CREATE PROCEDURE sp_recalc_all_client_balances()
            BEGIN
                DECLARE done INT DEFAULT FALSE;
                DECLARE c_user_id BIGINT UNSIGNED;
                DECLARE cur CURSOR FOR
                    SELECT DISTINCT user_id FROM v_work_order_balances WHERE balance_pending > 0;
                DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

                DELETE FROM client_balances;

                OPEN cur;
                read_loop: LOOP
                    FETCH cur INTO c_user_id;
                    IF done THEN
                        LEAVE read_loop;
                    END IF;
                    CALL sp_recalc_client_balance(c_user_id);
                END LOOP;
                CLOSE cur;
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'mysql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_insert');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_delete');
        DB::unprepared('DROP TRIGGER IF EXISTS tr_work_order_services_after_update');
        DB::unprepared('DROP VIEW IF EXISTS v_work_order_balances');
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_recalc_client_balance');
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_recalc_all_client_balances');
    }
};
