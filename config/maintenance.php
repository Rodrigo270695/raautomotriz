<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Alertas de mantenimiento
    |--------------------------------------------------------------------------
    | Días de anticipación antes de la fecha límite para enviar el aviso.
    | Km de anticipación antes de alcanzar el km límite para enviar el aviso.
    | Hora de ejecución diaria del job (formato HH:MM, zona Lima).
    */
    'alert_days_before' => (int) env('MAINTENANCE_ALERT_DAYS_BEFORE', 7),
    'alert_km_before'   => (int) env('MAINTENANCE_ALERT_KM_BEFORE', 500),
    'alert_hour'        => env('MAINTENANCE_ALERT_HOUR', '08:00'),
];
