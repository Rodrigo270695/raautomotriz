<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkOrder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'vehicle_id',
        'client_id',
        'created_by',
        'entry_date',
        'entry_time',
        'entry_mileage',
        'exit_mileage',
        'client_observation',
        'diagnosis',
        'status',
        'advance_payment_amount',
        'total_amount',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'entry_date' => 'date',
        'advance_payment_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * @return BelongsTo<Vehicle, $this>
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<WorkOrderPhoto, $this>
     */
    public function photos(): HasMany
    {
        return $this->hasMany(WorkOrderPhoto::class);
    }

    /**
     * @return HasMany<WorkOrderChecklistResult, $this>
     */
    public function checklistResults(): HasMany
    {
        return $this->hasMany(WorkOrderChecklistResult::class);
    }

    /**
     * @return HasMany<WorkOrderDiagnosis, $this>
     */
    public function diagnoses(): HasMany
    {
        return $this->hasMany(WorkOrderDiagnosis::class);
    }

    /**
     * @return HasMany<WorkOrderService, $this>
     */
    public function services(): HasMany
    {
        return $this->hasMany(WorkOrderService::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<WorkOrderTicket, $this>
     */
    public function tickets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(WorkOrderTicket::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<WorkOrderPayment, $this>
     */
    public function payments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(WorkOrderPayment::class);
    }

    /**
     * @return HasMany<NotificationLog, $this>
     */
    public function notificationLogs(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }

    /**
     * Recalcula total_amount con la suma de subtotales de los servicios/productos de la orden.
     * Debe llamarse después de cualquier cambio en work_order_services (store, update, destroy, applyPackage).
     */
    public function recalcTotalFromServices(): void
    {
        $total = (float) $this->services()->sum('subtotal');
        $this->update(['total_amount' => round($total, 2)]);
    }
}
