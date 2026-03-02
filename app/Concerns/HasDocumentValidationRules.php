<?php

namespace App\Concerns;

use Illuminate\Validation\Rule;

/**
 * Reglas de validación para documentos de identidad peruanos (DNI, RUC, CE, Pasaporte)
 * y teléfono celular. Reutilizado en FormRequests y en Actions de Fortify.
 */
trait HasDocumentValidationRules
{
    /** Tipos de documento válidos. */
    protected const DOCUMENT_TYPES = ['dni', 'ce', 'pasaporte', 'ruc'];

    /**
     * Reglas de validación para document_number según el tipo de documento.
     *
     * @param  string  $docType
     * @param  int|null  $ignoreUserId  ID de usuario a ignorar en la unicidad (para updates).
     * @return array<int, mixed>
     */
    protected function documentNumberRules(string $docType, ?int $ignoreUserId = null): array
    {
        $uniqueRule = $ignoreUserId !== null
            ? Rule::unique('users', 'document_number')->ignore($ignoreUserId)
            : Rule::unique('users', 'document_number');

        return match ($docType) {
            'dni' => ['required', 'string', 'size:8', 'regex:/^\d{8}$/', $uniqueRule],
            'ruc' => ['required', 'string', 'size:11', 'regex:/^\d{11}$/', $uniqueRule],
            default => ['required', 'string', 'max:20', 'regex:/^[A-Za-z0-9\-]+$/', $uniqueRule],
        };
    }

    /**
     * Reglas de validación para teléfono celular peruano (9 dígitos, inicia con 9).
     *
     * @return array<int, string>
     */
    protected function phoneRules(): array
    {
        return ['nullable', 'string', 'size:9', 'regex:/^9\d{8}$/'];
    }

    /**
     * Mensajes de error personalizados para document_number.
     *
     * @param  string  $docType
     * @return array<string, string>
     */
    protected function documentNumberMessages(string $docType): array
    {
        $regex = match ($docType) {
            'dni'  => 'El DNI debe tener exactamente 8 dígitos numéricos.',
            'ruc'  => 'El RUC debe tener exactamente 11 dígitos numéricos.',
            default => 'El número de documento solo puede contener letras, números y guiones.',
        };

        $size = match ($docType) {
            'dni'  => 'El DNI debe tener exactamente 8 dígitos.',
            'ruc'  => 'El RUC debe tener exactamente 11 dígitos.',
            default => 'El número de documento no debe exceder 20 caracteres.',
        };

        return [
            'document_number.regex' => $regex,
            'document_number.size'  => $size,
        ];
    }

    /**
     * Mensajes de error para teléfono.
     *
     * @return array<string, string>
     */
    protected function phoneMessages(): array
    {
        return [
            'phone.regex' => 'El celular debe tener 9 dígitos y comenzar con 9.',
            'phone.size'  => 'El celular debe tener exactamente 9 dígitos.',
        ];
    }
}
