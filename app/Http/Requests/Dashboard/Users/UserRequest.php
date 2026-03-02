<?php

namespace App\Http\Requests\Dashboard\Users;

use App\Concerns\HasDocumentValidationRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    use HasDocumentValidationRules;

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
        /** @var \App\Models\User|null $user */
        $user    = $this->route('user');
        $docType = (string) $this->input('document_type', '');

        $rules = [
            'first_name'      => ['required', 'string', 'max:120'],
            'last_name'       => ['required', 'string', 'max:120'],
            'document_type'   => ['required', 'string', 'in:'.implode(',', self::DOCUMENT_TYPES)],
            'document_number' => $this->documentNumberRules($docType, $user?->id),
            'username'        => [
                'required', 'string', 'max:255', 'regex:/^[a-z0-9_.-]+$/',
                Rule::unique('users', 'username')->ignore($user?->id),
            ],
            'email' => [
                'nullable', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($user?->id),
            ],
            'phone'   => $this->phoneRules(),
            'status'  => ['required', 'string', 'in:active,inactive'],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
        ];

        $rules['password'] = $this->isMethod('POST')
            ? ['required', 'string', 'confirmed', Password::defaults()]
            : ['nullable', 'string', 'confirmed', Password::defaults()];

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        $docType = (string) $this->input('document_type', '');

        return array_merge(
            $this->documentNumberMessages($docType),
            $this->phoneMessages(),
            ['username.regex' => 'El usuario solo puede contener letras minúsculas, números y los caracteres _ . -']
        );
    }

    public function attributes(): array
    {
        return [
            'first_name'      => 'nombre',
            'last_name'       => 'apellido',
            'document_type'   => 'tipo de documento',
            'document_number' => 'número de documento',
            'username'        => 'usuario',
            'email'           => 'correo',
            'phone'           => 'celular',
            'status'          => 'estado',
            'password'        => 'contraseña',
            'role_id'         => 'rol',
        ];
    }
}
