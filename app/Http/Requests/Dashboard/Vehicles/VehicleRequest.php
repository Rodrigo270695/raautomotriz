<?php

namespace App\Http\Requests\Dashboard\Vehicles;

use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()?->can('vehicles.create')
            : $this->user()?->can('vehicles.update');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('plate') && is_string($this->input('plate'))) {
            $this->merge(['plate' => strtoupper($this->input('plate'))]);
        }
        $merge = [];
        if ($this->input('year') === '' || $this->input('year') === null) {
            $merge['year'] = null;
        }
        if ($this->input('entry_mileage') === '' || $this->input('entry_mileage') === null) {
            $merge['entry_mileage'] = null;
        }
        if ($this->input('exit_mileage') === '' || $this->input('exit_mileage') === null) {
            $merge['exit_mileage'] = null;
        }
        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $vehicle = $this->route('vehicle');

        return [
            'plate' => [
                'required',
                'string',
                'max:20',
                Rule::unique('vehicles', 'plate')->ignore($vehicle?->id),
            ],
            'year' => ['nullable', 'integer', 'min:1900', 'max:' . (int) date('Y')],
            'color' => ['nullable', 'string', 'max:80'],
            'entry_mileage' => ['nullable', 'integer', 'min:0'],
            'exit_mileage' => ['nullable', 'integer', 'min:0'],
            'vehicle_model_id' => ['required', 'integer', 'exists:vehicle_models,id'],
            'client_id' => ['required', 'integer', 'exists:users,id'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'plate' => 'placa',
            'year' => 'año',
            'color' => 'color',
            'entry_mileage' => 'kilometraje de entrada',
            'exit_mileage' => 'kilometraje de salida',
            'vehicle_model_id' => 'modelo',
            'client_id' => 'cliente',
            'status' => 'estado',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        $currentYear = (int) date('Y');

        return [
            'year.max' => "El año no puede ser mayor a {$currentYear}.",
        ];
    }
}
