<?php

namespace App\Http\Requests\Dashboard\Users;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('POST')
            ? $this->user()?->can('users.create')
            : $this->user()?->can('users.update');
    }

    protected function prepareForValidation(): void
    {
        $roleId = $this->input('role_id');
        if ($roleId === '' || $roleId === null || $roleId === 'none') {
            $this->merge(['role_id' => null]);
        }
        $username = $this->input('username');
        if (is_string($username)) {
            $this->merge(['username' => strtolower($username)]);
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
            'username' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9_.-]+$/',
                Rule::unique('users', 'username')->ignore($user?->id),
            ],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user?->id),
            ],
            'phone' => ['nullable', 'string', 'size:9', 'regex:/^9\d{8}$/'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
        ];

        if ($this->isMethod('POST')) {
            $rules['password'] = ['required', 'string', 'confirmed', Password::defaults()];
        } else {
            $rules['password'] = ['nullable', 'string', 'confirmed', Password::defaults()];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        $docType = $this->input('document_type');
        $docMessages = [
            'document_number.regex' => $docType === 'ruc'
                ? 'El RUC debe tener exactamente 11 dígitos numéricos.'
                : 'El número de documento (DNI) debe tener exactamente 8 dígitos numéricos.',
            'document_number.size' => $docType === 'ruc'
                ? 'El RUC debe tener exactamente 11 dígitos.'
                : 'El número de documento (DNI) debe tener exactamente 8 dígitos.',
        ];
        return array_merge($docMessages, [
            'username.regex' => 'El usuario solo puede contener letras minúsculas, números y los caracteres _ . -',
            'phone.regex' => 'El celular debe tener 9 dígitos y comenzar con 9.',
            'phone.size' => 'El celular debe tener exactamente 9 dígitos.',
        ]);
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
            'role_id' => 'rol',
        ];
    }
}
