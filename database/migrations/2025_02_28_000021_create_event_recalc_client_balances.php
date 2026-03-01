<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Crea un evento MySQL (solo si driver = mysql) que ejecuta sp_recalc_all_client_balances() cada 1 día, para mantener client_balances (cuentas por cobrar) actualizado.
     * Horario: empieza al día siguiente a las 02:00. Requiere que el planificador de eventos esté activo: SET GLOBAL event_scheduler = ON;
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Evento: cada 24 horas recalcula todos los saldos pendientes por cliente (tabla client_balances) llamando a sp_recalc_all_client_balances.
        DB::unprepared("
            CREATE EVENT IF NOT EXISTS evt_recalc_client_balances_daily
            ON SCHEDULE EVERY 1 DAY
            STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 2 HOUR)
            ON COMPLETION PRESERVE
            ENABLE
            COMMENT 'Recalcula saldos pendientes por cliente (cuentas por cobrar)'
            DO CALL sp_recalc_all_client_balances()
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }
        DB::unprepared('DROP EVENT IF EXISTS evt_recalc_client_balances_daily');
    }
};
