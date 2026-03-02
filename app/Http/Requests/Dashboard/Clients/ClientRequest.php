<?php

namespace App\Http\Requests\Dashboard\Clients;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()?->can('clients.create')
            : $this->user()?->can('clients.update');
    }

    protected function prepareForValidation(): void
    {
        // El cliente se identifica por DNI: usamos número de documento como username para el login.
        $doc = $this->input('document_number');
        if (is_string($doc) && $doc !== '') {
            $this->merge(['username' => $doc]);
        }
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->route('user');

        $docType = $this->input('document_type');
        if ($docType === 'dni') {
            $documentNumberRules = ['required', 'string', 'size:8', 'regex:/^[0-9]{8}$/', Rule::unique('users', 'document_number')->ignore($user?->id)];
        } elseif ($docType === 'ruc') {
            $documentNumberRules = ['required', 'string', 'size:11', 'regex:/^[0-9]{11}$/', Rule::unique('users', 'document_number')->ignore($user?->id)];
        } else {
            $documentNumberRules = ['required', 'string', 'max:20', Rule::unique('users', 'document_number')->ignore($user?->id)];
        }

        $rules = [
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'document_type' => ['required', 'string', 'max:20', 'in:dni,ce,pasaporte,ruc'],
            'document_number' => $documentNumberRules,
            'username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user?->id)],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user?->id),
            ],
            'phone' => ['required', 'string', 'size:9', 'regex:/^9\d{8}$/'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ];

        if ($this->isMethod('POST')) {
            $rules['password'] = ['required', 'string', 'confirmed', Password::defaults()];
        } else {
            $rules['password'] = ['nullable', 'string', 'confirmed', Password::defaults()];
        }

        return $rules;
    }

    public function messages(): array
    {
        $docType = $this->input('document_type');
        return [
            'phone.regex' => 'El celular debe tener 9 dígitos y comenzar con 9.',
            'phone.size' => 'El celular debe tener exactamente 9 dígitos.',
            'document_number.regex' => $docType === 'ruc'
                ? 'El RUC debe tener exactamente 11 dígitos numéricos.'
                : 'El número de documento (DNI) debe tener exactamente 8 dígitos numéricos.',
            'document_number.size' => $docType === 'ruc'
                ? 'El RUC debe tener exactamente 11 dígitos.'
                : 'El número de documento (DNI) debe tener exactamente 8 dígitos.',
        ];
    }

    public function attributes(): array
    {
        return [
            'first_name' => 'nombre',
            'last_name' => 'apellido',
            'document_type' => 'tipo de documento',
            'document_number' => 'número de documento',
            'username' => 'usuario',
            'email' => 'correo',
            'phone' => 'celular',
            'status' => 'estado',
            'password' => 'contraseña',
        ];
    }
}
