<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientBalance extends Model
{
    protected $fillable = [
        'user_id',
        'total_pending',
        'last_updated',
    ];

    protected $casts = [
        'total_pending' => 'decimal:2',
        'last_updated'  => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
