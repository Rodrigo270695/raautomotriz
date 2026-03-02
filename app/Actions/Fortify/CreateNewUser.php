<?php

namespace App\Actions\Fortify;

use App\Concerns\HasDocumentValidationRules;
use App\Concerns\PasswordValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use HasDocumentValidationRules;
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user (siempre cliente).
     * Username = document_number para que pueda iniciar sesión con DNI/documento.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $docType = (string) ($input['document_type'] ?? '');

        $rules = [
            'first_name'      => ['required', 'string', 'max:120'],
            'last_name'       => ['required', 'string', 'max:120'],
            'document_type'   => ['required', 'string', 'in:'.implode(',', self::DOCUMENT_TYPES)],
            'document_number' => $this->documentNumberRules($docType),
            'email'           => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone'           => array_map(fn ($r) => $r === 'nullable' ? 'required' : $r, $this->phoneRules()),
            'password'        => $this->passwordRules(),
        ];

        Validator::make($input, $rules, array_merge(
            $this->documentNumberMessages($docType),
            $this->phoneMessages(),
            ['document_type.in' => 'El tipo de documento debe ser DNI, CE, Pasaporte o RUC.']
        ))->validate();

        $user = User::create([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'document_type' => $input['document_type'],
            'document_number' => $input['document_number'],
            'username' => Str::lower($input['document_number']),
            'email' => $input['email'] ?? null,
            'phone' => $input['phone'],
            'status' => 'active',
            'password' => $input['password'],
        ]);

        $user->assignRole('cliente');

        return $user;
    }
}
