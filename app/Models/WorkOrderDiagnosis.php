<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderDiagnosis extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'work_order_id',
        'diagnosis_text',
        'diagnosed_by',
        'diagnosed_at',
        'internal_notes',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'diagnosed_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<WorkOrder, $this>
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function diagnosedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diagnosed_by');
    }
}
