<?php

namespace App\Http\Requests\Dashboard\Services;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceChecklistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()?->can('service_checklists.create')
            : $this->user()?->can('service_checklists.update');
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $checklist = $this->route('checklist');

        return [
            'order_number' => [
                'nullable',
                'required_if:status,active',
                'integer',
                'min:1',
                Rule::unique('service_checklists', 'order_number')->ignore($checklist?->id),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('service_checklists', 'name')->ignore($checklist?->id),
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
            'order_number' => 'número de orden',
            'name' => 'nombre',
            'description' => 'descripción',
            'status' => 'estado',
        ];
    }
}
