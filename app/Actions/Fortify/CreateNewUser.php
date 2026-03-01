<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /** Tipos de documento válidos en Perú */
    private const TIPOS_DOCUMENTO = ['dni', 'ce', 'pasaporte', 'ruc'];

    /**
     * Validate and create a newly registered user (siempre cliente).
     * Username = document_number para que pueda iniciar sesión con DNI/documento.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $rules = [
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'document_type' => ['required', 'string', 'in:'.implode(',', self::TIPOS_DOCUMENTO)],
            'document_number' => ['required', 'string', 'max:20', 'unique:users,document_number'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'size:9', 'regex:/^9\d{8}$/'],
            'password' => $this->passwordRules(),
        ];

        $tipo = $input['document_type'] ?? '';
        if ($tipo === 'dni') {
            $rules['document_number'][] = 'size:8';
            $rules['document_number'][] = 'regex:/^\d{8}$/';
        } elseif ($tipo === 'ruc') {
            $rules['document_number'][] = 'size:11';
            $rules['document_number'][] = 'regex:/^\d{11}$/';
        } else {
            $rules['document_number'][] = 'regex:/^[A-Za-z0-9\-]+$/';
        }

        $docMsg = match ($tipo) {
            'dni' => 'El DNI debe tener exactamente 8 dígitos.',
            'ruc' => 'El RUC debe tener exactamente 11 dígitos.',
            default => 'El número de documento solo puede contener letras, números y guiones.',
        };

        Validator::make($input, $rules, [
            'document_number.regex' => $docMsg,
            'document_number.size' => $docMsg,
            'document_type.in' => 'El tipo de documento debe ser DNI, CE, Pasaporte o RUC.',
            'phone.regex' => 'El celular debe tener 9 dígitos y comenzar con 9.',
            'phone.size' => 'El celular debe tener exactamente 9 dígitos.',
        ])->validate();

        $user = User::create([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'document_type' => $input['document_type'],
            'document_number' => $input['document_number'],
            'username' => Str::lower($input['document_number']),
            'email' => $input['email'],
            'phone' => $input['phone'],
            'status' => 'active',
            'password' => $input['password'],
        ]);

        $user->assignRole('cliente');

        return $user;
    }
}
