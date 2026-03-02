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

        $nombre = trim($client->first_name ?? '');
        $saludo = $nombre !== '' ? "Estimado/a {$nombre}," : 'Estimado/a cliente,';

        $empresa = config('app.company_name', 'RA Automotriz S.A.C.');

        if (! $this->isUpdate) {
            $mensajeCuerpo = "Le informamos que hemos realizado el chequeo de ingreso de su vehículo en {$empresa}.\n\n"
                ."{$saludo}\n\n"
                .'Nuestro equipo completó la lista de verificación y hemos registrado el estado de cada ítem. '
                ."En este correo encontrará el detalle en PDF y las fotos de ingreso de su unidad.\n\n"
                .'Si tiene alguna consulta, no dude en contactarnos. ¡Gracias por confiar en nosotros!';

            $mensajeWhatsApp = "{$empresa}\n\n"
                ."Le informamos que hemos realizado el chequeo de ingreso de su vehículo y completado la lista de chequeo.\n\n"
                ."Le hemos enviado el detalle completo en un documento PDF junto con las fotos de ingreso de su unidad.\n\n"
                ."\n\nGracias por confiar en nosotros.";

            $asunto = "Chequeo realizado – Su vehículo fue revisado | {$empresa}";
        } else {
            $mensajeCuerpo = "Le informamos que hemos actualizado la lista de chequeo de ingreso de su vehículo en {$empresa}.\n\n"
                ."{$saludo}\n\n"
                ."Adjuntamos el documento PDF con la versión actualizada del chequeo, donde se reflejan los cambios realizados.\n\n"
                .'Si tiene alguna consulta, no dude en contactarnos. ¡Gracias por confiar en nosotros!';

            $mensajeWhatsApp = "{$empresa}\n\n"
                ."Hemos actualizado la lista de chequeo de ingreso de su vehículo.\n\n"
                ."Le enviamos el documento PDF con el detalle actualizado del chequeo.\n\n"
                .'Gracias por confiar en nosotros.';

            $asunto = 'Actualización de lista de chequeo – Orden #'.$workOrder->id;
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
