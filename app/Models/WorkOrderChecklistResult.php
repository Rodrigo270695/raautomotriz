<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderChecklistResult extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'work_order_id',
        'service_checklist_id',
        'checked',
        'note',
        'completed_at',
        'completed_by',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'checked' => 'boolean',
        'completed_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<WorkOrder, $this>
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * @return BelongsTo<ServiceChecklist, $this>
     */
    public function serviceChecklist(): BelongsTo
    {
        return $this->belongsTo(ServiceChecklist::class, 'service_checklist_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function completedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
