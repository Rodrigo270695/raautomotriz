<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\WorkOrderPaymentRequest;
use App\Jobs\SendPaymentNotificationJob;
use App\Models\WorkOrder;
use App\Models\WorkOrderPayment;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
     * Vista térmica del comprobante de pago (80mm).
     */
    public function printTicket(WorkOrder $work_order, WorkOrderPayment $payment): View
    {
        if ($payment->work_order_id !== (int) $work_order->id) {
            abort(404);
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
