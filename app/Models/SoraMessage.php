<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SoraMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'tokens_used',
    ];

    protected $casts = [
        'tokens_used' => 'integer',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(SoraConversation::class, 'conversation_id');
    }

    public function isFromUser(): bool
    {
        return $this->role === 'user';
    }

    public function isFromAssistant(): bool
    {
        return $this->role === 'assistant';
    }
}
