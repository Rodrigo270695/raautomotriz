<?php

namespace App\Http\Requests\Dashboard\Services;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServicePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()?->can('service_packages.create')
            : $this->user()?->can('service_packages.update');
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'service_type_id' => ['required', 'integer', Rule::exists('service_types', 'id')],
            'status' => ['required', 'string', 'in:active,inactive'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'interval_km' => ['nullable', 'integer', 'min:100', 'max:500000'],
            'interval_days' => ['nullable', 'integer', 'min:1', 'max:3650'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'description' => 'descripción',
            'service_type_id' => 'tipo de servicio',
            'status' => 'estado',
            'sort_order' => 'orden',
            'interval_km' => 'intervalo en km',
            'interval_days' => 'intervalo en días',
        ];
    }
}
