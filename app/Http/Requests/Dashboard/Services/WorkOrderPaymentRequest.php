<?php

namespace App\Http\Requests\Dashboard\Services;

use Illuminate\Foundation\Http\FormRequest;

class WorkOrderPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->routeIs('dashboard.services.work-orders.payments.store')
            ? ($this->user()?->can('work_order_payments.create') ?? false)
            : ($this->user()?->can('work_order_payments.update') ?? false);
    }

    /** @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:advance,partial,final'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'in:yape,plim,tarjeta,efectivo,otros'],
            'paid_at' => ['nullable', 'date'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'type' => 'tipo de pago',
            'amount' => 'monto',
            'payment_method' => 'método de pago',
            'paid_at' => 'fecha de pago',
            'reference' => 'referencia',
            'notes' => 'notas',
        ];
    }
}
