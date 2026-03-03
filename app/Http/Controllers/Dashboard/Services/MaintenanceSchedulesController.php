<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceAlert;
use App\Models\VehicleMaintenanceSchedule;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceSchedulesController extends Controller
{
    public function index(Request $request): Response
    {
        $daysBefore = (int) config('maintenance.alert_days_before', 7);
        $kmBefore   = (int) config('maintenance.alert_km_before', 500);
        $today      = Carbon::today();
        $alertDate  = Carbon::today()->addDays($daysBefore);

        $query = VehicleMaintenanceSchedule::with([
            'vehicle.vehicleModel.brand',
            'vehicle.client',
            'servicePackage',
            'serviceType',
            'latestAlert',
        ]);

        // Filtro: búsqueda por cliente o placa
        if ($search = $request->input('search')) {
            $query->whereHas('vehicle', function ($q) use ($search) {
                $q->where('plate', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($qc) use ($search) {
                      $qc->whereRaw("CONCAT(first_name,' ',last_name) LIKE ?", ["%{$search}%"]);
                  });
            });
        }

        // Filtro: estado del mantenimiento
        if ($status = $request->input('filter_status')) {
            $query->when($status === 'overdue', function ($q) use ($today) {
                $q->where(function ($q2) use ($today) {
                    $q2->where('next_due_date', '<', $today->toDateString())
                       ->orWhereNotNull('next_due_km');
                });
            })->when($status === 'approaching', function ($q) use ($today, $alertDate) {
                $q->where(function ($q2) use ($today, $alertDate) {
                    $q2->whereBetween('next_due_date', [$today->toDateString(), $alertDate->toDateString()])
                       ->orWhereNotNull('next_due_km');
                });
            })->when($status === 'ok', function ($q) use ($alertDate) {
                $q->where(function ($q2) use ($alertDate) {
                    $q2->where('next_due_date', '>', $alertDate->toDateString())
                       ->orWhereNull('next_due_date');
                });
            });
        }

        $perPage = (int) $request->input('per_page', 15);
        $schedules = $query->orderBy('next_due_date')->paginate($perPage)->withQueryString();

        // Calcular estado de cada registro
        $schedules->getCollection()->transform(function (VehicleMaintenanceSchedule $s) use ($today, $alertDate) {
            $status = 'ok';

            if ($s->next_due_date) {
                $dueDate = Carbon::parse($s->next_due_date);
                if ($dueDate->lt($today)) {
                    $status = 'overdue';
                } elseif ($dueDate->lte($alertDate)) {
                    $status = 'approaching';
                }
            }

            $s->setAttribute('computed_status', $status);
            $s->setAttribute('days_left', $s->next_due_date
                ? $today->diffInDays(Carbon::parse($s->next_due_date), false)
                : null);

            $latestAlert = $s->latestAlert;
            $s->setAttribute('last_alert_sent_at', $latestAlert?->sent_at?->toISOString());
            $s->setAttribute('last_alert_type', $latestAlert?->type);

            return $s;
        });

        $stats = $this->buildStats($today, $alertDate);

        $canResend = $request->user()?->can('maintenance_schedules.resend_notification');

        return Inertia::render('services/maintenance-schedules/index', [
            'schedules'   => $schedules,
            'filters'     => [
                'search'        => $request->input('search'),
                'filter_status' => $request->input('filter_status'),
                'per_page'      => $perPage,
            ],
            'stats'       => $stats,
            'config'      => [
                'days_before' => $daysBefore,
                'km_before'   => $kmBefore,
                'alert_hour'  => config('maintenance.alert_hour', '08:00'),
            ],
            'can'         => [
                'resend_notification' => $canResend,
            ],
        ]);
    }

    public function resendNotification(Request $request, VehicleMaintenanceSchedule $schedule): RedirectResponse
    {
        if (! $request->user()?->can('maintenance_schedules.resend_notification')) {
            abort(403);
        }

        $schedule->load(['vehicle.client', 'servicePackage', 'serviceType']);
        $vehicle = $schedule->vehicle;
        $client  = $vehicle?->client;

        if (! $vehicle || ! $client) {
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => 'No se encontró el vehículo o cliente asociado.']);
        }

        $today        = Carbon::today();
        $packageName  = $schedule->servicePackage?->name ?? $schedule->serviceType?->name ?? 'Mantenimiento';
        $plate        = $vehicle->plate ?? '—';
        $daysLeft     = $schedule->next_due_date
            ? $today->diffInDays(Carbon::parse($schedule->next_due_date), false)
            : null;

        $dateStr  = $schedule->next_due_date
            ? Carbon::parse($schedule->next_due_date)->format('d/m/Y')
            : null;

        if ($daysLeft !== null) {
            $daysText = $daysLeft > 0
                ? "en *{$daysLeft} día(s)* ({$dateStr})"
                : ($daysLeft === 0 ? "hoy ({$dateStr})" : "el {$dateStr} _(¡ya venció!)_");
        } else {
            $daysText = null;
        }

        $empresa = config('app.company_name', 'RA Automotriz S.A.C.');
        $nombre  = trim($client->first_name ?? '');

        $messageWa = "{$empresa}\n\n"
            . "🔧 *Recordatorio de mantenimiento*\n\n"
            . "Hola {$nombre},\n\n"
            . "Le recordamos que su vehículo *{$plate}* tiene programado:\n\n"
            . "📋 *{$packageName}*\n"
            . ($daysText ? "📅 Fecha límite: {$daysText}\n" : '')
            . ($schedule->next_due_km ? "🚗 Km límite: *{$schedule->next_due_km} km*\n" : '')
            . "\n¡Agéndate con nosotros para mantener tu vehículo en óptimas condiciones!\n"
            . "¡Gracias por confiar en " . config('app.company_name', 'RA Automotriz') . '!';

        $messageEmail = "Estimado/a {$nombre},\n\n"
            . "Le recordamos que su vehículo con placa *{$plate}* tiene programado el siguiente mantenimiento:\n\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n"
            . "Servicio  : {$packageName}\n"
            . ($dateStr ? "Fecha     : {$dateStr}\n" : '')
            . ($schedule->next_due_km ? "Km límite : {$schedule->next_due_km} km\n" : '')
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            . "Por favor, comuníquese con nosotros para agendar su cita.\n"
            . "¡Gracias por confiar en nosotros!";

        $subject = "Recordatorio: {$packageName} — {$plate} | {$empresa}";

        try {
            $notificationService = app(NotificationService::class);
            $waLog = $notificationService->sendWhatsApp($client, $messageWa);
            $notificationService->sendEmail($client, $subject, $messageEmail);

            MaintenanceAlert::create([
                'vehicle_id'          => $schedule->vehicle_id,
                'user_id'             => $client->id,
                'service_package_id'  => $schedule->service_package_id,
                'service_type_id'     => $schedule->service_type_id,
                'type'                => $schedule->next_due_date ? 'due_date' : 'due_km',
                'scheduled_at'        => now(),
                'sent_at'             => now(),
                'notification_log_id' => $waLog?->id,
            ]);
        } catch (\Throwable $e) {
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => 'Error al enviar la notificación: ' . $e->getMessage()]);
        }

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => "Aviso de mantenimiento reenviado a {$nombre} correctamente."]);
    }

    private function buildStats(Carbon $today, Carbon $alertDate): array
    {
        $total      = VehicleMaintenanceSchedule::count();
        $overdue    = VehicleMaintenanceSchedule::where('next_due_date', '<', $today->toDateString())->count();
        $approaching = VehicleMaintenanceSchedule::whereBetween('next_due_date', [
            $today->toDateString(),
            $alertDate->toDateString(),
        ])->count();
        $ok = max(0, $total - $overdue - $approaching);

        return compact('total', 'overdue', 'approaching', 'ok');
    }
}
