<?php

namespace App\Http\Requests\Dashboard\Services;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServicePackageItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()?->can('service_package_items.create')
            : $this->user()?->can('service_package_items.update');
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $servicePackage = $this->route('service_package');
        $item = $this->route('item');

        return [
            'type' => ['nullable'],
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id'),
                Rule::unique('service_package_items', 'product_id')
                    ->where(fn ($q) => $q->where('service_package_id', $servicePackage?->id))
                    ->ignore($item?->id),
            ],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'type' => 'tipo',
            'product_id' => 'producto',
            'quantity' => 'cantidad',
            'unit_price' => 'precio unitario',
            'notes' => 'notas',
        ];
    }
}

