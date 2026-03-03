<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promotion extends Model
{
    protected $fillable = [
        'title',
        'description',
        'image_path',
        'is_active',
        'notifications_sent',
        'notifications_sent_at',
        'starts_at',
        'ends_at',
        'created_by',
    ];

    protected $casts = [
        'is_active'              => 'boolean',
        'notifications_sent'     => 'boolean',
        'notifications_sent_at'  => 'datetime',
        'starts_at'              => 'datetime',
        'ends_at'                => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sends(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PromotionSend::class);
    }

    /** Solo la activa vigente actualmente */
    public function scopeCurrentlyActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }
}
