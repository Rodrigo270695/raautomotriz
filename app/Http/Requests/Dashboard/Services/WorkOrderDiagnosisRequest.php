<?php

namespace App\Http\Requests\Dashboard\Services;

use Illuminate\Foundation\Http\FormRequest;

class WorkOrderDiagnosisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->routeIs('dashboard.services.work-orders.diagnoses.store')
            ? ($this->user()?->can('work_order_diagnoses.create') ?? false)
            : ($this->user()?->can('work_order_diagnoses.update') ?? false);
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if ($this->has('diagnosed_at') && $this->input('diagnosed_at') === '') {
            $merge['diagnosed_at'] = null;
        }
        if ($this->has('internal_notes') && $this->input('internal_notes') === '') {
            $merge['internal_notes'] = null;
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
        return [
            'diagnosis_text' => ['required', 'string', 'max:10000'],
            'diagnosed_at' => ['nullable', 'date'],
            'internal_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'diagnosis_text' => 'diagnóstico',
            'diagnosed_at' => 'fecha del diagnóstico',
            'internal_notes' => 'notas internas',
        ];
    }
}
