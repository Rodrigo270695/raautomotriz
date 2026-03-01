<?php

namespace App\Http\Requests\Dashboard\Inventory;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()?->can('products.create')
            : $this->user()?->can('products.update');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name') && is_string($this->input('name'))) {
            $this->merge(['name' => strtoupper(trim($this->input('name')))]);
        }
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('product');

        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'name')->ignore($product?->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'sale_price' => ['required', 'numeric', 'min:0'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'keywords' => ['nullable', 'array'],
            'keywords.*' => ['string', 'max:255'],
            'image' => ['nullable', 'image', 'max:5120'],
        ];

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['inventory_brand_id'] = ['sometimes', 'integer', 'exists:inventory_brands,id'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.max' => 'La imagen no debe superar 5 MB.',
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
            'sale_price' => 'precio de venta',
            'purchase_price' => 'precio de compra',
            'stock' => 'stock',
            'status' => 'estado',
            'keywords' => 'palabras clave',
            'keywords.*' => 'palabra clave',
            'image' => 'imagen',
            'inventory_brand_id' => 'marca',
        ];
    }
}
