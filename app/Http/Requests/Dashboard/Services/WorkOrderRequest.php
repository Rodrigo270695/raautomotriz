<?php

namespace App\Http\Requests\Dashboard\Services;

use Illuminate\Foundation\Http\FormRequest;

class WorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()?->can('work_orders.create')
            : $this->user()?->can('work_orders.update');
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'client_id' => ['required', 'integer', 'exists:users,id'],
            'entry_date' => ['required', 'date'],
            'entry_time' => ['required', 'date_format:H:i'],
            'entry_mileage' => ['nullable', 'integer', 'min:0'],
            'exit_mileage' => ['nullable', 'integer', 'min:0'],
            'client_observation' => ['nullable', 'string', 'max:2000'],
            'diagnosis' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', 'string', 'in:ingreso,en_checklist,diagnosticado,en_reparacion,listo_para_entregar,entregado,cancelado'],
            'advance_payment_amount' => ['nullable', 'numeric', 'min:0'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'vehicle_id' => 'vehículo',
            'client_id' => 'cliente',
            'entry_date' => 'fecha de ingreso',
            'entry_time' => 'hora de ingreso',
            'entry_mileage' => 'kilometraje de ingreso',
            'exit_mileage' => 'kilometraje de salida',
            'client_observation' => 'observación del cliente',
            'diagnosis' => 'diagnóstico',
            'status' => 'estado',
            'advance_payment_amount' => 'adelanto',
            'total_amount' => 'total',
            'notes' => 'notas',
        ];
    }
}
