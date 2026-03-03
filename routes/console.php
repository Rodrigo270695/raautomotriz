<?php

use App\Jobs\CheckMaintenanceAlertsJob;
use App\Mail\ClientNotificationMail;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Revisa diariamente a la hora configurada (Lima) si hay vehículos próximos a mantenimiento
Schedule::job(new CheckMaintenanceAlertsJob)
    ->dailyAt(env('MAINTENANCE_ALERT_HOUR', '08:00'))
    ->timezone('America/Lima')
    ->name('check-maintenance-alerts')
    ->withoutOverlapping()
    ->onOneServer();

// Comando manual para forzar la revisión sin esperar el cron
Artisan::command('maintenance:check', function () {
    $this->info('Revisando alertas de mantenimiento...');
    CheckMaintenanceAlertsJob::dispatchSync();
    $this->info('Listo.');
})->purpose('Revisa y envía alertas de mantenimiento pendientes');

Artisan::command('mail:test {email=rodrigo_06_27@hotmail.com}', function (string $email) {
    $this->info("Enviando correo de prueba a: {$email}");
    try {
        Mail::to($email)->send(new ClientNotificationMail(
            'Prueba de correo – RA Automotriz',
            "Hola,\n\nEste es un correo de prueba desde RA Automotriz. Si recibiste este mensaje, la configuración SMTP está funcionando correctamente.\n\nSaludos.",
            []
        ));
        $this->info('Correo enviado correctamente. Revisa la bandeja (y carpeta de spam) de '.$email);
    } catch (\Throwable $e) {
        $this->error('Error al enviar: '.$e->getMessage());
        throw $e;
    }
})->purpose('Envía un correo de prueba a la dirección indicada (por defecto rodrigo_06_27@hotmail.com)');
