<?php

namespace App\Jobs;

use App\Models\MaintenanceAlert;
use App\Models\VehicleMaintenanceSchedule;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Se ejecuta diariamente (schedulado en routes/console.php).
 * Revisa todos los calendarios de mantenimiento y genera alertas cuando:
 *   - El vehículo ya alcanzó o superó next_due_km, o
 *   - La next_due_date ya llegó o está a ALERT_DAYS_BEFORE días.
 */
class CheckMaintenanceAlertsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(NotificationService $notificationService): void
    {
        $daysBefore = (int) config('maintenance.alert_days_before', 7);
        $today      = Carbon::today();
        $alertDate  = Carbon::today()->addDays($daysBefore);

        $schedules = VehicleMaintenanceSchedule::with([
            'vehicle.client',
            'servicePackage',
            'serviceType',
        ])->get();

        $kmBefore = (int) config('maintenance.alert_km_before', 500);

        foreach ($schedules as $schedule) {
            $vehicle = $schedule->vehicle;
            $client  = $vehicle?->client;

            if (! $vehicle || ! $client) {
                continue;
            }

            $this->checkByDate($schedule, $client, $today, $alertDate, $daysBefore, $notificationService);
            $this->checkByKm($schedule, $client, $vehicle, $kmBefore, $notificationService);
        }
    }

    private function checkByDate(
        VehicleMaintenanceSchedule $schedule,
        $client,
        Carbon $today,
        Carbon $alertDate,
        int $daysBefore,
        NotificationService $notificationService
    ): void {
        if (! $schedule->next_due_date) {
            return;
        }

        $dueDate = Carbon::parse($schedule->next_due_date);

        if ($dueDate->gt($alertDate)) {
            return; // Aún no es momento de alertar
        }

        // ¿Ya enviamos una alerta reciente para esto?
        $alreadySent = MaintenanceAlert::where('vehicle_id', $schedule->vehicle_id)
            ->where('service_package_id', $schedule->service_package_id)
            ->where('type', 'due_date')
            ->where('scheduled_at', '>=', Carbon::now()->subDays($daysBefore + 1))
            ->exists();

        if ($alreadySent) {
            return;
        }

        $packageName = $schedule->servicePackage?->name ?? $schedule->serviceType?->name ?? 'Mantenimiento';
        $plate       = $schedule->vehicle->plate ?? '—';
        $dateStr     = $dueDate->format('d/m/Y');
        $daysLeft    = $today->diffInDays($dueDate, false);
        $daysText    = $daysLeft > 0 ? "en {$daysLeft} día(s) ({$dateStr})" : "el {$dateStr} (¡ya venció!)";

        $message = "🔧 *Recordatorio de mantenimiento*\n\n"
            ."Hola {$client->first_name}, tu vehículo *{$plate}* tiene programado:\n\n"
            ."📋 *{$packageName}*\n"
            ."📅 Fecha límite: *{$daysText}*\n\n"
            ."¡Agenda tu cita con nosotros para mantener tu vehículo en óptimas condiciones!";

        $subject = "Recordatorio: {$packageName} — {$plate}";

        try {
            $waLog    = $notificationService->sendWhatsApp($client, $message);
            $emailLog = $notificationService->sendEmail($client, $subject, $message);

            $alert = MaintenanceAlert::create([
                'vehicle_id'         => $schedule->vehicle_id,
                'user_id'            => $client->id,
                'service_package_id' => $schedule->service_package_id,
                'service_type_id'    => $schedule->service_type_id,
                'type'               => 'due_date',
                'scheduled_at'       => now(),
                'sent_at'            => now(),
                'notification_log_id'=> $waLog->id,
            ]);

            Log::info('MaintenanceAlert sent (due_date)', [
                'alert_id'   => $alert->id,
                'vehicle_id' => $schedule->vehicle_id,
                'due_date'   => $dateStr,
            ]);
        } catch (\Throwable $e) {
            Log::error('CheckMaintenanceAlertsJob due_date failed', [
                'vehicle_id' => $schedule->vehicle_id,
                'error'      => $e->getMessage(),
            ]);
        }
    }

    private function checkByKm(
        VehicleMaintenanceSchedule $schedule,
        $client,
        $vehicle,
        int $kmBefore,
        NotificationService $notificationService
    ): void {
        if (! $schedule->next_due_km) {
            return;
        }

        // Usamos el exit_mileage de la última orden como referencia del km actual
        $currentMileage = $vehicle->lastWorkOrder?->exit_mileage
            ?? $schedule->last_service_mileage;

        if (! $currentMileage) {
            return;
        }

        $kmLeft = $schedule->next_due_km - $currentMileage;

        if ($kmLeft > $kmBefore) {
            return; // Aún quedan muchos km
        }

        $alreadySent = MaintenanceAlert::where('vehicle_id', $schedule->vehicle_id)
            ->where('service_package_id', $schedule->service_package_id)
            ->where('type', 'due_km')
            ->where('scheduled_at', '>=', Carbon::now()->subDays(30))
            ->exists();

        if ($alreadySent) {
            return;
        }

        $packageName = $schedule->servicePackage?->name ?? $schedule->serviceType?->name ?? 'Mantenimiento';
        $plate       = $vehicle->plate ?? '—';
        $kmText      = $kmLeft > 0
            ? "en aproximadamente *{$kmLeft} km* (a los {$schedule->next_due_km} km)"
            : "¡ya vence a los {$schedule->next_due_km} km!";

        $message = "🔧 *Recordatorio de mantenimiento por kilometraje*\n\n"
            ."Hola {$client->first_name}, tu vehículo *{$plate}* necesita:\n\n"
            ."📋 *{$packageName}*\n"
            ."🚗 Vence: {$kmText}\n\n"
            ."¡Agenda tu cita con nosotros!";

        $subject = "Recordatorio: {$packageName} — {$plate}";

        try {
            $waLog = $notificationService->sendWhatsApp($client, $message);
            $notificationService->sendEmail($client, $subject, $message);

            $alert = MaintenanceAlert::create([
                'vehicle_id'         => $schedule->vehicle_id,
                'user_id'            => $client->id,
                'service_package_id' => $schedule->service_package_id,
                'service_type_id'    => $schedule->service_type_id,
                'type'               => 'due_km',
                'scheduled_at'       => now(),
                'sent_at'            => now(),
                'notification_log_id'=> $waLog->id,
            ]);

            Log::info('MaintenanceAlert sent (due_km)', [
                'alert_id'   => $alert->id,
                'vehicle_id' => $schedule->vehicle_id,
                'km_left'    => $kmLeft,
            ]);
        } catch (\Throwable $e) {
            Log::error('CheckMaintenanceAlertsJob due_km failed', [
                'vehicle_id' => $schedule->vehicle_id,
                'error'      => $e->getMessage(),
            ]);
        }
    }
}
