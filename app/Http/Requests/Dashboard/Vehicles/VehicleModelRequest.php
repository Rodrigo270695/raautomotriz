<?php

namespace App\Http\Requests\Dashboard\Vehicles;

use App\Models\VehicleModel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VehicleModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()?->can('vehicle_models.create')
            : $this->user()?->can('vehicle_models.update');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name') && is_string($this->input('name'))) {
            $this->merge(['name' => strtoupper($this->input('name'))]);
        }
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $vehicleModel = $this->route('vehicle_model');
        $brandId = $vehicleModel?->brand_id ?? $this->input('brand_id');

        return [
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_models', 'name')->where('brand_id', $brandId)->ignore($vehicleModel?->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'brand_id' => 'marca',
            'name' => 'nombre',
            'description' => 'descripción',
            'status' => 'estado',
        ];
    }
}
