<?php

namespace App\Jobs;

use App\Models\WorkOrder;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Notifica al cliente por email y WhatsApp cuando se confirma la entrega del vehículo (check de entrega).
 * Incluye opcionalmente el recordatorio de próximo servicio (días o km) si se indicó al entregar.
 */
class SendDeliveredNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public int $timeout = 60;

    public function __construct(
        public readonly int $workOrderId,
        public readonly ?int $nextDueDays = null,
    ) {}

    public function handle(NotificationService $notificationService): void
    {
        $workOrder = WorkOrder::with([
            'vehicle.vehicleModel.brand',
            'client',
        ])->find($this->workOrderId);

        if (! $workOrder) {
            Log::warning('SendDeliveredNotificationJob: work order not found', ['id' => $this->workOrderId]);
            return;
        }

        $client = $workOrder->client;
        if (! $client) {
            return;
        }

        $empresa     = config('app.company_name', 'RA Automotriz S.A.C.');
        $localTz     = config('app.local_timezone', 'America/Lima');
        $clientName  = trim($client->first_name . ' ' . $client->last_name) ?: 'Cliente';
        $vehicle     = $workOrder->vehicle;
        $vehicleLabel = $vehicle
            ? trim(
                ($vehicle->vehicleModel?->brand?->name ?? '') . ' ' .
                ($vehicle->vehicleModel?->name ?? '') . ' ' .
                ($vehicle->plate ?? '')
            )
            : '—';
        if ($vehicleLabel === '' || $vehicleLabel === ' ') {
            $vehicleLabel = '—';
        }

        $fechaHora = Carbon::now($localTz)->format('d/m/Y \a \l\a\s H:i') . ' (hora Perú)';
        $saludo    = "Estimado/a {$clientName},";

        $recordatorioLine = '';
        $recordatorioWa   = '';
        if ($this->nextDueDays !== null && $this->nextDueDays > 0) {
            $proximaFecha = Carbon::now($localTz)->addDays($this->nextDueDays)->format('d/m/Y');
            $recordatorioLine = "Próximo servicio recomendado: en {$this->nextDueDays} días (aprox. {$proximaFecha}). Le enviaremos un recordatorio cuando se acerque la fecha.";
            $recordatorioWa   = "📆 *Próximo servicio:* en {$this->nextDueDays} días (aprox. {$proximaFecha}). Le recordaremos cuando se acerque.\n\n";
        } else {
            $recordatorioLine = "Le enviaremos un recordatorio cuando se acerque la fecha de su próximo mantenimiento.";
            $recordatorioWa   = "Le recordaremos cuando se acerque su próximo mantenimiento.\n\n";
        }

        $exitMileage = $workOrder->exit_mileage;
        $kmLine      = $exitMileage !== null
            ? "\nKilometraje al entregar: " . number_format($exitMileage, 0, '', ',') . " km"
            : '';

        $asunto = "Entrega confirmada – Orden #{$workOrder->id} | {$empresa}";

        $mensajeEmail = "{$saludo}\n\n"
            . "Confirmamos que ha retirado su vehículo de nuestro taller. ¡Gracias por confiar en nosotros!\n\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n"
            . "Vehículo   : {$vehicleLabel}\n"
            . "Orden N.°  : {$workOrder->id}\n"
            . "Fecha/Hora : {$fechaHora}\n"
            . "{$kmLine}\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            . "{$recordatorioLine}\n\n"
            . "Ante cualquier consulta, estamos a su disposición.";

        $mensajeWhatsApp = "{$empresa}\n\n"
            . "✅ *Entrega confirmada*\n\n"
            . "{$saludo}\n\n"
            . "Confirmamos que ha retirado su vehículo. ¡Gracias por confiar en nosotros!\n\n"
            . "🚗 *Vehículo:* {$vehicleLabel}\n"
            . "📋 *Orden N.°:* {$workOrder->id}\n"
            . "📅 *Fecha:* {$fechaHora}\n";
        if ($exitMileage !== null) {
            $mensajeWhatsApp .= "🛣️ *Km al entregar:* " . number_format($exitMileage, 0, '', ',') . " km\n";
        }
        $mensajeWhatsApp .= "\n{$recordatorioWa}"
            . "¡Que tenga un excelente recorrido!";

        $notificationService->sendEmail($client, $asunto, $mensajeEmail, $workOrder);
        $notificationService->sendWhatsApp($client, $mensajeWhatsApp, $workOrder);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('SendDeliveredNotificationJob failed permanently', [
            'work_order_id' => $this->workOrderId,
            'error'         => $e->getMessage(),
        ]);
    }
}
