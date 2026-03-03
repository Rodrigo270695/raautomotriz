<?php

namespace App\Jobs;

use App\Models\WorkOrder;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWelcomeNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public readonly int $workOrderId) {}

    public function handle(NotificationService $notificationService): void
    {
        $workOrder = WorkOrder::with(['vehicle.vehicleModel.brand', 'client'])->find($this->workOrderId);

        if (! $workOrder) {
            Log::warning('SendWelcomeNotificationJob: work order not found', ['id' => $this->workOrderId]);
            return;
        }

        $client = $workOrder->client;
        if (! $client) {
            return;
        }

        $vehicle = $workOrder->vehicle;
        $nombre = trim($client->first_name ?? '');
        $marca = $vehicle?->vehicleModel?->brand?->name ?? '';
        $modelo = $vehicle?->vehicleModel?->name ?? '';
        $placa = $vehicle?->plate ?? '';
        $vehiculoTexto = trim("{$marca} {$modelo}");

        if ($vehiculoTexto !== '' && $placa !== '') {
            $vehiculoTexto .= " (placa {$placa})";
        } elseif ($placa !== '') {
            $vehiculoTexto = "placa {$placa}";
        }
        if ($vehiculoTexto === '') {
            $vehiculoTexto = 'su vehículo';
        }

        $empresa     = config('app.company_name', 'RA Automotriz S.A.C.');
        $saludo      = $nombre !== '' ? "Estimado/a {$nombre}," : 'Estimado/a cliente,';
        $saludoNombre = $nombre !== '' ? ", {$nombre}" : '';

        $kmTexto = ($workOrder->entry_mileage !== null && $workOrder->entry_mileage !== '')
            ? number_format((float) $workOrder->entry_mileage, 0, '', ',').' km'
            : null;

        // ── Mensaje WhatsApp (con emojis y negrita) ───────────────────
        $mensajeWhatsApp = "🔧 *{$empresa}*\n\n"
            ."🎉 *¡Bienvenido/a{$saludoNombre}!*\n\n"
            ."Le informamos que su vehículo ya está en nuestro taller:\n\n"
            ."🚗 *Vehículo:* {$vehiculoTexto}\n"
            ."🔢 *N.° de orden:* #{$workOrder->id}\n"
            .($kmTexto !== null ? "🛣️ *Km. de ingreso:* {$kmTexto}\n" : '')
            ."\n📋 Nuestro equipo realizará el chequeo y diagnóstico correspondiente. "
            ."Le iremos informando del avance en cada etapa.\n\n"
            ."¡Gracias por confiar en nosotros! 💪";

        // ── Mensaje email (limpio y formal) ───────────────────────────
        $mensajeEmail = "{$saludo}\n\n"
            ."Le informamos que su vehículo \"{$vehiculoTexto}\" ha ingresado a nuestro taller.\n\n"
            ."━━━━━━━━━━━━━━━━━━━━━━━━\n"
            ."N.° de orden  : #{$workOrder->id}\n"
            ."Vehículo      : {$vehiculoTexto}\n"
            .($kmTexto !== null ? "Km. de ingreso: {$kmTexto}\n" : '')
            ."━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            ."Nuestro equipo realizará el chequeo y diagnóstico correspondiente; "
            ."le mantendremos informado/a en cada etapa.\n\n"
            ."Ante cualquier consulta, estamos a su disposición.\n\n"
            ."Gracias por confiar en nosotros.";

        $asunto = "Bienvenida – Su vehículo ingresó a {$empresa} | Orden #{$workOrder->id}";

        $notificationService->sendEmail($client, $asunto, $mensajeEmail, $workOrder);
        $notificationService->sendWhatsApp($client, $mensajeWhatsApp, $workOrder);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('SendWelcomeNotificationJob failed permanently', [
            'work_order_id' => $this->workOrderId,
            'error' => $e->getMessage(),
        ]);
    }
}
