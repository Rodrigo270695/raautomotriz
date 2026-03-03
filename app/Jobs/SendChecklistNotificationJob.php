<?php

namespace App\Jobs;

use App\Models\WorkOrder;
use App\Models\WorkOrderChecklistResult;
use App\Models\WorkOrderPhoto;
use App\Services\NotificationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SendChecklistNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public int $timeout = 180;

    public function __construct(
        public readonly int $workOrderId,
        public readonly bool $isUpdate = false,
    ) {}

    public function handle(NotificationService $notificationService): void
    {
        $workOrder = WorkOrder::with([
            'vehicle.vehicleModel.brand',
            'client',
            'checklistResults.serviceChecklist',
            'photos',
        ])->find($this->workOrderId);

        if (! $workOrder) {
            Log::warning('SendChecklistNotificationJob: work order not found', ['id' => $this->workOrderId]);
            return;
        }

        $client = $workOrder->client;
        if (! $client) {
            return;
        }

        $clientName = trim($client->first_name.' '.$client->last_name) ?: 'Cliente';
        $vehicle = $workOrder->vehicle;
        $vehicleLabel = $vehicle
            ? trim(($vehicle->vehicleModel?->brand?->name ?? '').' '.($vehicle->vehicleModel?->name ?? '').' '.($vehicle->plate ?? ''))
            : '—';

        $checklistRows = $workOrder->checklistResults->map(function (WorkOrderChecklistResult $r) {
            return [
                'name' => $r->serviceChecklist?->name ?? '—',
                'checked' => (bool) $r->checked,
                'note' => $r->note ?? '',
            ];
        })->all();

        $pdfPath = null;
        $generatedAt = Carbon::now(config('app.local_timezone', 'America/Lima'));

        try {
            $pdfRelativePath = 'notifications/checklist-orden-'.$workOrder->id.'.pdf';
            $logoDataUri = null;
            $logoPath = public_path('logorasf.png');
            if (is_file($logoPath)) {
                $logoDataUri = 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath));
            }
            Pdf::loadView('pdf.checklist-report', [
                'workOrder' => $workOrder,
                'clientName' => $clientName,
                'vehicleLabel' => $vehicleLabel,
                'checklistRows' => $checklistRows,
                'generatedAt' => $generatedAt,
                'isUpdate' => $this->isUpdate,
                'logoDataUri' => $logoDataUri,
            ])->save($pdfRelativePath, 'public');
            $pdfPath = $pdfRelativePath;
        } catch (\Throwable $e) {
            report($e);
        }

        $nombre       = trim($client->first_name ?? '');
        $saludo       = $nombre !== '' ? "Estimado/a {$nombre}," : 'Estimado/a cliente,';
        $saludoNombre = $nombre !== '' ? ", {$nombre}" : '';
        $empresa      = config('app.company_name', 'RA Automotriz S.A.C.');

        $totalItems = count($checklistRows);
        $okItems    = count(array_filter($checklistRows, fn ($r) => $r['checked']));
        $resumen    = $totalItems > 0 ? "{$okItems}/{$totalItems} ítems en buen estado" : '';

        if (! $this->isUpdate) {
            // ── Primera entrega del checklist ──────────────────────────
            $mensajeWhatsApp = "🔧 *{$empresa}*\n\n"
                ."✅ *¡Chequeo de ingreso completado{$saludoNombre}!*\n\n"
                ."Hemos revisado su vehículo y completado la lista de verificación:\n\n"
                ."🚗 *Vehículo:* {$vehicleLabel}\n"
                ."🔢 *Orden N.°:* #{$workOrder->id}\n"
                .($resumen !== '' ? "📋 *Resultado:* {$resumen}\n" : '')
                ."📸 *Fotos de ingreso:* registradas\n\n"
                ."Le enviamos el detalle completo en PDF adjunto junto con las fotos de ingreso.\n\n"
                ."¡Seguimos trabajando en su vehículo! 🔩";

            $mensajeCuerpo = "{$saludo}\n\n"
                ."Le informamos que hemos completado el chequeo de ingreso de su vehículo en {$empresa}.\n\n"
                ."━━━━━━━━━━━━━━━━━━━━━━━━\n"
                ."Vehículo  : {$vehicleLabel}\n"
                ."Orden N.° : #{$workOrder->id}\n"
                .($resumen !== '' ? "Resultado : {$resumen}\n" : '')
                ."━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Adjunto encontrará el documento PDF con el detalle completo del chequeo "
                ."y las fotos de ingreso de su unidad.\n\n"
                ."Si tiene alguna consulta, no dude en contactarnos.\n\n"
                ."¡Gracias por confiar en nosotros!";

            $asunto = "✅ Chequeo completado – Orden #{$workOrder->id} | {$empresa}";
        } else {
            // ── Actualización del checklist ────────────────────────────
            $mensajeWhatsApp = "🔧 *{$empresa}*\n\n"
                ."🔄 *Lista de chequeo actualizada{$saludoNombre}*\n\n"
                ."Hemos realizado cambios en la lista de verificación de su vehículo:\n\n"
                ."🚗 *Vehículo:* {$vehicleLabel}\n"
                ."🔢 *Orden N.°:* #{$workOrder->id}\n"
                .($resumen !== '' ? "📋 *Resultado actualizado:* {$resumen}\n" : '')
                ."\nLe enviamos el PDF con el detalle actualizado adjunto.\n\n"
                ."¡Seguimos a su disposición! 🔩";

            $mensajeCuerpo = "{$saludo}\n\n"
                ."Le informamos que hemos actualizado la lista de chequeo de su vehículo.\n\n"
                ."━━━━━━━━━━━━━━━━━━━━━━━━\n"
                ."Vehículo  : {$vehicleLabel}\n"
                ."Orden N.° : #{$workOrder->id}\n"
                .($resumen !== '' ? "Resultado : {$resumen}\n" : '')
                ."━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
                ."Adjunto encontrará el PDF con la versión actualizada del chequeo.\n\n"
                ."Si tiene alguna consulta, no dude en contactarnos.\n\n"
                ."¡Gracias por confiar en nosotros!";

            $asunto = "🔄 Chequeo actualizado – Orden #{$workOrder->id} | {$empresa}";
        }

        $attachments = $this->isUpdate
            ? array_filter([$pdfPath])
            : array_filter([$pdfPath, ...$workOrder->photos->where('type', WorkOrderPhoto::TYPE_ENTRY)->pluck('path')->all()]);

        $notificationService->sendEmail($client, $asunto, $mensajeCuerpo, $workOrder, $attachments);
        $notificationService->sendWhatsApp($client, $mensajeWhatsApp, $workOrder, $attachments);

        if ($pdfPath) {
            $pdfFullPath = Storage::disk('public')->path($pdfPath);
            $notificationService->sendWhatsAppDocument(
                $client,
                $pdfFullPath,
                'Checklist-orden-'.$workOrder->id.'.pdf',
                $this->isUpdate
                    ? 'Checklist actualizado – Orden #'.$workOrder->id
                    : 'Checklist de ingreso – Orden #'.$workOrder->id,
                $workOrder
            );

            // Eliminar el PDF temporal después de todos los envíos para no acumular archivos.
            try {
                Storage::disk('public')->delete($pdfPath);
            } catch (\Throwable $e) {
                Log::warning('SendChecklistNotificationJob: no se pudo eliminar el PDF temporal', [
                    'path' => $pdfPath,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if (! $this->isUpdate) {
            $entryPhotos = $workOrder->photos->where('type', WorkOrderPhoto::TYPE_ENTRY);
            foreach ($entryPhotos as $photo) {
                if ($photo->path && Storage::disk('public')->exists($photo->path)) {
                    $imageFullPath = Storage::disk('public')->path($photo->path);
                    $notificationService->sendWhatsAppImage($client, $imageFullPath, 'Foto de ingreso – Orden #'.$workOrder->id, $workOrder);
                }
            }
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('SendChecklistNotificationJob failed permanently', [
            'work_order_id' => $this->workOrderId,
            'is_update' => $this->isUpdate,
            'error' => $e->getMessage(),
        ]);
    }
}
