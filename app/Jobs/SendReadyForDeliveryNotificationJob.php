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
 * Notifica al cliente por email y WhatsApp cuando el técnico marca la orden como "Listo para entregar".
 * Mensaje con iconos (estilo comprobante de pago) para que el cliente sepa que puede retirar su vehículo.
 */
class SendReadyForDeliveryNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public int $timeout = 60;

    public function __construct(
        public readonly int $workOrderId,
    ) {}

    public function handle(NotificationService $notificationService): void
    {
        $workOrder = WorkOrder::with([
            'vehicle.vehicleModel.brand',
            'client',
        ])->find($this->workOrderId);

        if (! $workOrder) {
            Log::warning('SendReadyForDeliveryNotificationJob: work order not found', ['id' => $this->workOrderId]);
            return;
        }

        $client = $workOrder->client;
        if (! $client) {
            return;
        }

        $empresa    = config('app.company_name', 'RA Automotriz S.A.C.');
        $localTz    = config('app.local_timezone', 'America/Lima');
        $clientName = trim($client->first_name . ' ' . $client->last_name) ?: 'Cliente';
        $vehicle    = $workOrder->vehicle;
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

        $saludo = "Estimado/a {$clientName},";

        $asunto = "¡Su vehículo está listo para entregar! – Orden #{$workOrder->id} | {$empresa}";

        $mensajeEmail = "{$saludo}\n\n"
            . "Le informamos que su vehículo ya está listo para ser retirado en nuestro taller.\n\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n"
            . "Vehículo   : {$vehicleLabel}\n"
            . "Orden N.°  : {$workOrder->id}\n"
            . "Estado     : Listo para entregar\n"
            . "Fecha/Hora : {$fechaHora}\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            . "Puede pasar a recogerlo en nuestro horario de atención:\n"
            . "Lunes a Sábado de 08:00 a 18:00.\n\n"
            . "Dirección: El Ayllu 267, La Victoria, Chiclayo.\n\n"
            . "Ante cualquier consulta, estamos a su disposición. ¡Gracias por confiar en nosotros!";

        $mensajeWhatsApp = "{$empresa}\n\n"
            . "✅ *¡Listo para entregar!*\n\n"
            . "{$saludo}\n\n"
            . "Su vehículo *ya está listo* para que lo retire en nuestro taller.\n\n"
            . "🚗 *Vehículo:* {$vehicleLabel}\n"
            . "📋 *Orden N.°:* {$workOrder->id}\n"
            . "📅 *Fecha:* {$fechaHora}\n\n"
            . "📍 *Dirección:* El Ayllu 267, La Victoria, Chiclayo\n"
            . "🕐 *Horario:* Lun–Sáb 08:00–18:00\n\n"
            . "¡Lo esperamos para entregarle su vehículo!";

        $notificationService->sendEmail($client, $asunto, $mensajeEmail, $workOrder);
        $notificationService->sendWhatsApp($client, $mensajeWhatsApp, $workOrder);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('SendReadyForDeliveryNotificationJob failed permanently', [
            'work_order_id' => $this->workOrderId,
            'error'         => $e->getMessage(),
        ]);
    }
}
