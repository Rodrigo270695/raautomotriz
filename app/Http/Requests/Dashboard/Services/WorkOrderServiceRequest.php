<?php

namespace App\Http\Requests\Dashboard\Services;

use Illuminate\Foundation\Http\FormRequest;

class WorkOrderServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->routeIs('dashboard.services.work-orders.services.store')
            ? ($this->user()?->can('work_order_services.create') ?? false)
            : ($this->user()?->can('work_order_services.update') ?? false);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'type' => ['nullable', 'string', 'in:product,service'],
            'description' => ['required', 'string', 'max:500'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'product_id' => 'producto',
            'type' => 'tipo de línea',
            'description' => 'descripción',
            'quantity' => 'cantidad',
            'unit_price' => 'precio unitario',
        ];
    }
}

