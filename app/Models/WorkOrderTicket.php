<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WorkOrderTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_order_id',
        'printed_at',
        'printed_by',
        'token',
        'service_count',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'printed_at' => 'datetime',
    ];

    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function printedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'printed_by');
    }

    public static function generateToken(): string
    {
        return strtoupper(Str::random(8));
    }
}
