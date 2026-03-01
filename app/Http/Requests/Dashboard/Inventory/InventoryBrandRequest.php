<?php

namespace App\Http\Requests\Dashboard\Inventory;

use App\Models\InventoryBrand;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InventoryBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()?->can('inventory_brands.create')
            : $this->user()?->can('inventory_brands.update');
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
        $brand = $this->route('inventory_brand');
        $typeId = $brand?->inventory_type_id ?? $this->input('inventory_type_id');

        return [
            'inventory_type_id' => ['required', 'integer', 'exists:inventory_types,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('inventory_brands', 'name')->where('inventory_type_id', $typeId)->ignore($brand?->id),
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
            'inventory_type_id' => 'tipo',
            'name' => 'nombre',
            'description' => 'descripción',
            'status' => 'estado',
        ];
    }
}
