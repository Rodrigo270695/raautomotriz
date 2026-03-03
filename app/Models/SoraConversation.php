<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SoraConversation extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'vehicle_plate',
        'problem_summary',
        'preliminary_diagnoses',
        'status',
        'escalated_at',
    ];

    protected $casts = [
        'preliminary_diagnoses' => 'array',
        'escalated_at'          => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SoraMessage::class, 'conversation_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isEscalated(): bool
    {
        return $this->status === 'escalated';
    }
}
