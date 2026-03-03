<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromotionSend extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'promotion_id',
        'user_id',
        'sent_whatsapp',
        'sent_email',
        'sent_at',
    ];

    protected $casts = [
        'sent_whatsapp' => 'boolean',
        'sent_email'    => 'boolean',
        'sent_at'       => 'datetime',
    ];

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
