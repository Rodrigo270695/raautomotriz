<?php

namespace App\Http\Requests\Dashboard\Marketing;

use Illuminate\Foundation\Http\FormRequest;

class ListSoraConversationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('sora_conversations.view') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'search'    => ['nullable', 'string', 'max:100'],
            'status'    => ['nullable', 'string', 'in:active,closed,escalated'],
            'type'      => ['nullable', 'string', 'in:all,registered,guest'],
            'date_from' => ['nullable', 'date'],
            'date_to'   => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page'  => ['nullable', 'integer', 'in:10,20,50'],
        ];
    }

    /**
     * Devuelve los filtros normalizados con valores por defecto.
     * Por defecto muestra los últimos 7 días (hoy + 6 días anteriores).
     *
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        return [
            'search'    => $this->string('search')->trim()->value() ?: null,
            'status'    => $this->input('status'),
            'type'      => $this->input('type', 'all'),
            'date_from' => $this->input('date_from') ?? now()->subDays(6)->toDateString(),
            'date_to'   => $this->input('date_to')   ?? now()->toDateString(),
            'per_page'  => (int) $this->input('per_page', 20),
        ];
    }
}
