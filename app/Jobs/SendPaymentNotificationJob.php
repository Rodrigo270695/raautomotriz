<?php

namespace App\Jobs;

use App\Models\WorkOrder;
use App\Models\WorkOrderPayment;
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

class SendPaymentNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public int $timeout = 120;

    public function __construct(
        public readonly int $workOrderId,
        public readonly int $paymentId,
    ) {}

    public function handle(NotificationService $notificationService): void
    {
        $workOrder = WorkOrder::with([
            'vehicle.vehicleModel.brand',
            'client',
            'payments',
            'services',
        ])->find($this->workOrderId);

        if (! $workOrder) {
            Log::warning('SendPaymentNotificationJob: work order not found', ['id' => $this->workOrderId]);
            return;
        }

        $payment = $workOrder->payments->find($this->paymentId);
        if (! $payment) {
            Log::warning('SendPaymentNotificationJob: payment not found', ['payment_id' => $this->paymentId]);
            return;
        }

        $client = $workOrder->client;
        if (! $client) {
            return;
        }

        // ── Variables comunes ──────────────────────────────────────────
        $empresa   = config('app.company_name', 'RA Automotriz S.A.C.');
        $localTz   = config('app.local_timezone', 'America/Lima');
        $igvRate   = (float) config('app.igv_rate', 0.18);
        $igvPct    = (int) round($igvRate * 100);

        $generatedAt = Carbon::now($localTz);
        $paidAt      = $payment->paid_at
            ? Carbon::parse($payment->paid_at)->setTimezone($localTz)
            : $generatedAt;

        $clientLabel  = trim($client->first_name.' '.$client->last_name) ?: 'Cliente';
        $vehicle      = $workOrder->vehicle;
        $vehicleLabel = $vehicle
            ? trim(
                ($vehicle->vehicleModel?->brand?->name ?? '').' '.
                ($vehicle->vehicleModel?->name ?? '').' '.
                ($vehicle->plate ?? '')
            )
            : '—';

        // ── Datos financieros ──────────────────────────────────────────
        $orderTotal       = (float) $workOrder->total_amount;
        $totalPaid        = (float) $workOrder->payments->sum('amount');
        $saldoPendiente   = max(0, round($orderTotal - $totalPaid, 2));

        $amount           = (float) $payment->amount;
        $baseImponible    = round($amount / (1 + $igvRate), 2);
        $igvAmount        = round($amount - $baseImponible, 2);

        $orderBaseImponible = round($orderTotal / (1 + $igvRate), 2);
        $orderIgvAmount     = round($orderTotal - $orderBaseImponible, 2);

        // ── Labels ────────────────────────────────────────────────────
        $typeTitles = [
            'advance' => 'COMPROBANTE DE ADELANTO',
            'partial' => 'COMPROBANTE DE ABONO',
            'final'   => 'COMPROBANTE DE PAGO FINAL',
        ];
        $typeLabels = [
            'advance' => 'Adelanto',
            'partial' => 'Abono parcial',
            'final'   => 'Pago final',
        ];
        $methodLabels = [
            'yape'     => 'Yape',
            'plim'     => 'Plim',
            'tarjeta'  => 'Tarjeta',
            'efectivo' => 'Efectivo',
            'otros'    => 'Otros',
        ];

        $title       = $typeTitles[$payment->type]  ?? 'COMPROBANTE DE PAGO';
        $typeLabel   = $typeLabels[$payment->type]   ?? ucfirst($payment->type ?? '');
        $methodLabel = isset($methodLabels[$payment->payment_method ?? ''])
            ? $methodLabels[$payment->payment_method]
            : ($payment->payment_method ?? '—');

        // ── Lista de todos los pagos (para historial en PDF) ──────────
        $allPayments = $workOrder->payments->sortBy('id')->map(function (WorkOrderPayment $p) use ($payment, $methodLabels, $typeLabels, $localTz) {
            return [
                'reference'   => $p->reference,
                'type_label'  => $typeLabels[$p->type] ?? ucfirst($p->type ?? ''),
                'method_label'=> isset($methodLabels[$p->payment_method ?? ''])
                    ? $methodLabels[$p->payment_method]
                    : ($p->payment_method ?? '—'),
                'paid_at'     => $p->paid_at
                    ? Carbon::parse($p->paid_at)->setTimezone($localTz)->format('d/m/Y H:i')
                    : '—',
                'amount'      => number_format((float) $p->amount, 2),
                'is_current'  => $p->id === $payment->id,
            ];
        })->values()->all();

        // ── Lista de servicios ────────────────────────────────────────
        $services = $workOrder->services->map(fn ($s) => [
            'description' => $s->description ?: '—',
            'type'        => $s->type ?? 'service',
            'quantity'    => number_format((float) $s->quantity, 2),
            'unit_price'  => number_format((float) $s->unit_price, 2),
            'subtotal'    => number_format((float) $s->subtotal, 2),
        ])->all();

        // ── Logo Base64 ───────────────────────────────────────────────
        $logoDataUri = null;
        $logoPath    = public_path('logorasf.png');
        if (is_file($logoPath)) {
            $logoDataUri = 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath));
        }

        // ── Generar PDF ───────────────────────────────────────────────
        $pdfPath = null;
        try {
            $pdfRelativePath = 'notifications/comprobante-pago-'.$workOrder->id.'-'.$payment->id.'.pdf';

            Pdf::loadView('pdf.payment-receipt', compact(
                'workOrder', 'payment', 'client', 'title', 'typeLabel', 'methodLabel',
                'clientLabel', 'vehicleLabel', 'paidAt', 'generatedAt',
                'baseImponible', 'igvAmount', 'igvPct',
                'orderTotal', 'totalPaid', 'saldoPendiente',
                'orderBaseImponible', 'orderIgvAmount',
                'allPayments', 'services', 'empresa', 'logoDataUri'
            ))->save($pdfRelativePath, 'public');

            $pdfPath = $pdfRelativePath;
        } catch (\Throwable $e) {
            Log::error('SendPaymentNotificationJob: PDF generation failed', [
                'work_order_id' => $this->workOrderId,
                'payment_id'    => $this->paymentId,
                'error'         => $e->getMessage(),
            ]);
            report($e);
        }

        // ── Mensajes ──────────────────────────────────────────────────
        $nombre = trim($client->first_name ?? '');
        $saludo = $nombre !== '' ? "Estimado/a {$nombre}," : 'Estimado/a cliente,';

        $saldoTexto = $saldoPendiente > 0
            ? 'Saldo pendiente: S/ '.number_format($saldoPendiente, 2).'.'
            : 'Su orden ha sido cancelada en su totalidad. ¡Gracias!';

        $asunto = "{$title} – Orden #{$workOrder->id} | {$empresa}";

        $mensajeEmail = "{$saludo}\n\n"
            ."Le informamos que hemos registrado un pago en su orden de servicio N.° {$workOrder->id}.\n\n"
            ."━━━━━━━━━━━━━━━━━━━━━━━━\n"
            ."Vehículo : {$vehicleLabel}\n"
            ."Referencia: {$payment->reference}\n"
            ."Tipo      : {$typeLabel}\n"
            ."Método    : {$methodLabel}\n"
            ."Monto     : S/ ".number_format($amount, 2)."\n"
            ."━━━━━━━━━━━━━━━━━━━━━━━━\n"
            ."Total de la orden : S/ ".number_format($orderTotal, 2)."\n"
            ."Total pagado      : S/ ".number_format($totalPaid, 2)."\n"
            ."{$saldoTexto}\n"
            ."━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            ."Adjunto encontrará el comprobante en formato PDF.\n\n"
            .'Ante cualquier consulta, estamos a su disposición. ¡Gracias por confiar en nosotros!';

        $mensajeWhatsApp = "{$empresa}\n\n"
            ."✅ *Pago registrado*\n\n"
            ."{$saludo}\n\n"
            ."Hemos registrado un pago en su orden N.° {$workOrder->id}:\n\n"
            ."🚗 *Vehículo:* {$vehicleLabel}\n"
            ."💳 *Método:* {$methodLabel}\n"
            ."🧾 *Ref.:* {$payment->reference}\n"
            ."💰 *Monto pagado:* S/ ".number_format($amount, 2)."\n\n"
            ."📊 *Resumen de pagos:*\n"
            ."• Total de la orden: S/ ".number_format($orderTotal, 2)."\n"
            ."• Total pagado: S/ ".number_format($totalPaid, 2)."\n"
            .($saldoPendiente > 0
                ? "• Saldo pendiente: S/ ".number_format($saldoPendiente, 2)
                : "• ✓ Orden pagada en su totalidad")."\n\n"
            ."Le enviamos el comprobante en PDF adjunto.\n\n"
            .'¡Gracias por su pago!';

        // ── Enviar notificaciones ─────────────────────────────────────
        $attachments = $pdfPath ? [$pdfPath] : [];

        $notificationService->sendEmail($client, $asunto, $mensajeEmail, $workOrder, $attachments);
        $notificationService->sendWhatsApp($client, $mensajeWhatsApp, $workOrder);

        if ($pdfPath) {
            $pdfFullPath = Storage::disk('public')->path($pdfPath);

            $notificationService->sendWhatsAppDocument(
                $client,
                $pdfFullPath,
                'Comprobante-pago-'.$payment->reference.'.pdf',
                "{$typeLabel} – Orden #{$workOrder->id} – S/ ".number_format($amount, 2),
                $workOrder
            );

            // Eliminar PDF temporal después de todos los envíos
            try {
                Storage::disk('public')->delete($pdfPath);
            } catch (\Throwable $e) {
                Log::warning('SendPaymentNotificationJob: no se pudo eliminar el PDF temporal', [
                    'path'  => $pdfPath,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('SendPaymentNotificationJob failed permanently', [
            'work_order_id' => $this->workOrderId,
            'payment_id'    => $this->paymentId,
            'error'         => $e->getMessage(),
        ]);
    }
}
