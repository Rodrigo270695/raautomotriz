<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\WorkOrderPaymentRequest;
use App\Jobs\SendPaymentNotificationJob;
use App\Models\WorkOrder;
use App\Models\WorkOrderPayment;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\View\View;

class WorkOrderPaymentController extends Controller
{
    public function store(WorkOrderPaymentRequest $request, WorkOrder $work_order): RedirectResponse
    {
        $data = $request->validated();

        $orderTotal = (float) $work_order->total_amount;
        $alreadyPaid = (float) $work_order->payments()->sum('amount');

        if ($orderTotal <= 0) {
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => 'Debe guardar primero los servicios y productos de la orden para registrar pagos.'])
                ->withErrors(['amount' => 'No hay total a pagar. Guarde los servicios/productos de la orden.'])
                ->withInput();
        }

        if (round($alreadyPaid, 2) >= round($orderTotal, 2)) {
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => 'La orden ya está pagada en su totalidad. No puede agregar más pagos.'])
                ->withErrors(['amount' => 'La orden ya está pagada.'])
                ->withInput();
        }

        if ($data['type'] === 'advance' && $work_order->payments()->where('type', 'advance')->exists()) {
            $data['type'] = 'partial';
        }

        $maxAllowed = max(0, round($orderTotal - $alreadyPaid, 2));
        if ($data['amount'] > $maxAllowed) {
            $msg = 'El monto no puede superar el total de la orden. Total: S/ '.number_format($orderTotal, 2).'. Ya pagado: S/ '.number_format($alreadyPaid, 2).'. Máximo permitido: S/ '.number_format($maxAllowed, 2).'.';
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => $msg])
                ->withErrors(['amount' => $msg])
                ->withInput();
        }

        // El input datetime-local llega en hora local de Perú → convertir a UTC para almacenar.
        $localTz = config('app.local_timezone', 'America/Lima');
        $paidAt = ! empty($data['paid_at'])
            ? Carbon::parse($data['paid_at'], $localTz)->setTimezone('UTC')
            : now();

        $nextNum = $work_order->payments()->count() + 1;
        $reference = 'PAG-'.$work_order->id.'-'.str_pad((string) $nextNum, 4, '0', STR_PAD_LEFT);

        $isInitialAdvance = ($data['type'] ?? '') === 'advance'
            && ! $work_order->payments()->where('is_initial_advance', true)->exists();

        $payment = $work_order->payments()->create([
            'type' => $data['type'],
            'is_initial_advance' => $isInitialAdvance,
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'] ?? null,
            'paid_at' => $paidAt,
            'reference' => $data['reference'] ?? $reference,
            'notes' => $data['notes'] ?? null,
        ]);

        if ($isInitialAdvance) {
            $work_order->update(['advance_payment_amount' => (float) $data['amount']]);
        }

        SendPaymentNotificationJob::dispatch($work_order->id, $payment->id);

        $printUrl = route('dashboard.services.work-orders.payments.print', [
            'work_order' => $work_order->id,
            'payment' => $payment->id,
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Pago registrado correctamente.'])
            ->with('payment_print_url', $printUrl);
    }

    public function update(WorkOrderPaymentRequest $request, WorkOrder $work_order, WorkOrderPayment $payment): RedirectResponse
    {
        if ($payment->work_order_id !== (int) $work_order->id) {
            abort(404);
        }

        $data = $request->validated();

        $orderTotal = (float) $work_order->total_amount;
        $alreadyPaid = (float) $work_order->payments()->where('id', '!=', $payment->id)->sum('amount');
        $maxAllowed = max(0, round($orderTotal - $alreadyPaid, 2));
        if ($data['amount'] > $maxAllowed) {
            $msg = 'El monto no puede superar el total de la orden. Total: S/ '.number_format($orderTotal, 2).'. Otros pagos: S/ '.number_format($alreadyPaid, 2).'. Máximo permitido: S/ '.number_format($maxAllowed, 2).'.';
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => $msg])
                ->withErrors(['amount' => $msg])
                ->withInput();
        }

        $localTz = config('app.local_timezone', 'America/Lima');
        $paidAt = ! empty($data['paid_at'])
            ? Carbon::parse($data['paid_at'], $localTz)->setTimezone('UTC')
            : $payment->paid_at;

        $payment->update([
            'type' => $data['type'],
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'] ?? null,
            'paid_at' => $paidAt,
            'reference' => $data['reference'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Pago actualizado correctamente.']);
    }

    public function destroy(WorkOrder $work_order, WorkOrderPayment $payment): RedirectResponse
    {
        if ($payment->work_order_id !== (int) $work_order->id) {
            abort(404);
        }

        if ($payment->is_initial_advance) {
            $work_order->update(['advance_payment_amount' => 0]);
        }
        $payment->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Pago eliminado correctamente.']);
    }

    /**
     * Descarga el comprobante de pago en PDF (mismo documento que se envía al cliente por correo).
     * Acceso: staff con work_order_payments.view o cliente dueño de la orden con my_orders.view.
     */
    public function downloadReceiptPdf(Request $request, WorkOrder $work_order, WorkOrderPayment $payment): Response
    {
        if ($payment->work_order_id !== (int) $work_order->id) {
            abort(404);
        }
        $user = $request->user();
        $canByRole = $user?->can('work_order_payments.view');
        $canAsClient = $user && (int) $work_order->client_id === (int) $user->id && $user->can('my_orders.view');
        if (! $canByRole && ! $canAsClient) {
            abort(403);
        }

        $work_order->load([
            'vehicle.vehicleModel.brand',
            'client',
            'payments',
            'services',
        ]);
        $payment = $work_order->payments->find($payment->id);
        $client = $work_order->client;

        $empresa = config('app.company_name', 'RA Automotriz S.A.C.');
        $localTz = config('app.local_timezone', 'America/Lima');
        $igvRate = (float) config('app.igv_rate', 0.18);
        $igvPct = (int) round($igvRate * 100);

        $generatedAt = Carbon::now($localTz);
        $paidAt = $payment->paid_at
            ? Carbon::parse($payment->paid_at)->setTimezone($localTz)
            : $generatedAt;

        $clientLabel = trim($client->first_name.' '.$client->last_name) ?: 'Cliente';
        $vehicle = $work_order->vehicle;
        $vehicleLabel = $vehicle
            ? trim(
                ($vehicle->vehicleModel?->brand?->name ?? '').' '.
                ($vehicle->vehicleModel?->name ?? '').' '.
                ($vehicle->plate ?? '')
            )
            : '—';

        $orderTotal = (float) $work_order->total_amount;
        $totalPaid = (float) $work_order->payments->sum('amount');
        $saldoPendiente = max(0, round($orderTotal - $totalPaid, 2));

        $amount = (float) $payment->amount;
        $baseImponible = round($amount / (1 + $igvRate), 2);
        $igvAmount = round($amount - $baseImponible, 2);

        $orderBaseImponible = round($orderTotal / (1 + $igvRate), 2);
        $orderIgvAmount = round($orderTotal - $orderBaseImponible, 2);

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

        $title = $typeTitles[$payment->type] ?? 'COMPROBANTE DE PAGO';
        $typeLabel = $typeLabels[$payment->type] ?? ucfirst($payment->type ?? '');
        $methodLabel = isset($methodLabels[$payment->payment_method ?? ''])
            ? $methodLabels[$payment->payment_method]
            : ($payment->payment_method ?? '—');

        $allPayments = $work_order->payments->sortBy('id')->map(function (WorkOrderPayment $p) use ($payment, $methodLabels, $typeLabels, $localTz) {
            return [
                'reference'    => $p->reference,
                'type_label'   => $typeLabels[$p->type] ?? ucfirst($p->type ?? ''),
                'method_label' => isset($methodLabels[$p->payment_method ?? ''])
                    ? $methodLabels[$p->payment_method]
                    : ($p->payment_method ?? '—'),
                'paid_at'      => $p->paid_at
                    ? Carbon::parse($p->paid_at)->setTimezone($localTz)->format('d/m/Y H:i')
                    : '—',
                'amount'       => number_format((float) $p->amount, 2),
                'is_current'    => $p->id === $payment->id,
            ];
        })->values()->all();

        $services = $work_order->services->map(fn ($s) => [
            'description' => $s->description ?: '—',
            'type'        => $s->type ?? 'service',
            'quantity'    => number_format((float) $s->quantity, 2),
            'unit_price'  => number_format((float) $s->unit_price, 2),
            'subtotal'    => number_format((float) $s->subtotal, 2),
        ])->all();

        $logoDataUri = null;
        $logoPath = public_path('logorasf.png');
        if (is_file($logoPath)) {
            $logoDataUri = 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath));
        }

        $workOrder = $work_order;
        $pdf = Pdf::loadView('pdf.payment-receipt', compact(
            'workOrder', 'payment', 'client', 'title', 'typeLabel', 'methodLabel',
            'clientLabel', 'vehicleLabel', 'paidAt', 'generatedAt',
            'baseImponible', 'igvAmount', 'igvPct',
            'orderTotal', 'totalPaid', 'saldoPendiente',
            'orderBaseImponible', 'orderIgvAmount',
            'allPayments', 'services', 'empresa', 'logoDataUri'
        ));

        $filename = 'Comprobante-pago-'.($payment->reference ?? $payment->id).'.pdf';

        return $pdf->stream($filename);
    }

    /**
     * Vista térmica del comprobante de pago (80mm).
     * Acceso: staff con work_order_payments.view o cliente dueño de la orden con my_orders.view.
     */
    public function printTicket(Request $request, WorkOrder $work_order, WorkOrderPayment $payment): View
    {
        if ($payment->work_order_id !== (int) $work_order->id) {
            abort(404);
        }
        $user = $request->user();
        $canByRole = $user?->can('work_order_payments.view');
        $canAsClient = $user && (int) $work_order->client_id === (int) $user->id && $user->can('my_orders.view');
        if (! $canByRole && ! $canAsClient) {
            abort(403);
        }

        $work_order->load(['vehicle.vehicleModel:id,name', 'client:id,first_name,last_name']);
        $amount = (float) $payment->amount;
        $baseImponible = round($amount / 1.18, 2);
        $igv = round($amount - $baseImponible, 2);

        $typeTitles = [
            'advance' => 'COMPROBANTE DE ADELANTO',
            'partial' => 'COMPROBANTE DE ABONO',
            'final' => 'COMPROBANTE DE PAGO',
        ];
        $methodLabels = [
            'yape' => 'Yape',
            'plim' => 'Plim',
            'tarjeta' => 'Tarjeta',
            'efectivo' => 'Efectivo',
            'otros' => 'Otros',
        ];
        $title = $typeTitles[$payment->type] ?? 'COMPROBANTE DE PAGO';
        $methodLabel = $payment->payment_method && isset($methodLabels[$payment->payment_method])
            ? $methodLabels[$payment->payment_method]
            : ($payment->payment_method ?? '—');

        $vehicleLabel = $work_order->vehicle
            ? trim($work_order->vehicle->plate.' '.($work_order->vehicle->vehicleModel?->name ?? ''))
            : '—';
        $clientLabel = $work_order->client
            ? trim($work_order->client->first_name.' '.$work_order->client->last_name)
            : '—';

        return view('thermal.payment-ticket', [
            'work_order' => $work_order,
            'payment' => $payment,
            'title' => $title,
            'vehicleLabel' => $vehicleLabel,
            'clientLabel' => $clientLabel,
            'methodLabel' => $methodLabel,
            'baseImponible' => $baseImponible,
            'igv' => $igv,
            'amount' => $amount,
        ]);
    }

    public function resendNotification(Request $request, WorkOrder $work_order, WorkOrderPayment $payment): RedirectResponse
    {
        if (! $request->user()->can('work_order_payments.resend_notification')) {
            abort(403);
        }

        if ($payment->work_order_id !== $work_order->id) {
            abort(404);
        }

        SendPaymentNotificationJob::dispatch($work_order->id, $payment->id);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Notificación de pago reenviada al cliente.']);
    }
}
