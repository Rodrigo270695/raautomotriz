<?php

namespace App\Http\Requests\Dashboard\Marketing;

use Illuminate\Foundation\Http\FormRequest;

class ListSoraAppointmentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('sora_appointments.view') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'search'    => ['nullable', 'string', 'max:100'],
            'status'    => ['nullable', 'string', 'in:pending,confirmed,cancelled'],
            'type'      => ['nullable', 'string', 'in:all,registered,guest'],
            'date_from' => ['nullable', 'date'],
            'date_to'   => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page'  => ['nullable', 'integer', 'in:10,20,50'],
        ];
    }

    /**
     * Devuelve los filtros normalizados con valores por defecto.
     * Por defecto muestra los próximos 7 días (hoy + 6 días siguientes)
     *
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        $today = now()->toDateString();

        return [
            'search'    => $this->string('search')->trim()->value() ?: null,
            'status'    => $this->input('status'),
            'type'      => $this->input('type', 'all'),
            'date_from' => $this->input('date_from') ?? $today,
            'date_to'   => $this->input('date_to')   ?? now()->addDays(6)->toDateString(),
            'per_page'  => (int) $this->input('per_page', 20),
        ];
    }
}

