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

        $kilometraje = $workOrder->entry_mileage !== null && $workOrder->entry_mileage !== ''
            ? ' con kilometraje de ingreso: '.number_format((float) $workOrder->entry_mileage, 0, '', ',').' km.'
            : '.';

        $empresa = config('app.company_name', 'RA Automotriz S.A.C.');
        $saludo = $nombre !== '' ? "Estimado/a {$nombre}," : 'Estimado/a cliente,';
        $mensaje = "Bienvenido a {$empresa}\n\n"
            ."{$saludo}\n\n"
            ."Le informamos que {$vehiculoTexto} ha ingresado a nuestro taller{$kilometraje}\n\n"
            ."Nuestro equipo realizará el chequeo y diagnóstico correspondiente; le mantendremos informado/a en cada etapa.\n\n"
            .'Gracias por confiar en nosotros. ¡Estamos a su disposición!';

        $asunto = "Bienvenida – Su vehículo ha ingresado a {$empresa}";

        $notificationService->sendEmail($client, $asunto, $mensaje, $workOrder);
        $notificationService->sendWhatsApp($client, $mensaje, $workOrder);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('SendWelcomeNotificationJob failed permanently', [
            'work_order_id' => $this->workOrderId,
            'error' => $e->getMessage(),
        ]);
    }
}
