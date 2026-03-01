<?php

namespace App\Http\Requests\Dashboard\Services;

use Illuminate\Foundation\Http\FormRequest;

class WorkOrderChecklistResultsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('work_order_checklist_results.update') ?? false;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'results' => ['required', 'array'],
            'results.*.service_checklist_id' => ['required', 'integer', 'exists:service_checklists,id'],
            'results.*.checked' => ['required', 'boolean'],
            'results.*.note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'results.*.service_checklist_id' => 'ítem',
            'results.*.checked' => 'bueno',
            'results.*.note' => 'nota',
        ];
    }
}
