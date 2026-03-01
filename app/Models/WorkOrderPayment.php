<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderPayment extends Model
{
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'work_order_id',
        'type',
        'is_initial_advance',
        'amount',
        'payment_method',
        'paid_at',
        'reference',
        'notes',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'amount' => 'decimal:2',
        'is_initial_advance' => 'boolean',
        'paid_at' => 'datetime',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }
}
