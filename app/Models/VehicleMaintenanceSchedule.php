<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class VehicleMaintenanceSchedule extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'vehicle_id',
        'service_package_id',
        'service_type_id',
        'interval_km',
        'interval_days',
        'last_work_order_id',
        'last_service_at',
        'last_service_mileage',
        'next_due_km',
        'next_due_date',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'interval_km'          => 'integer',
        'interval_days'        => 'integer',
        'last_service_at'      => 'datetime',
        'last_service_mileage' => 'integer',
        'next_due_km'          => 'integer',
        'next_due_date'        => 'date',
    ];

    /** @return BelongsTo<Vehicle, $this> */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /** @return BelongsTo<ServicePackage, $this> */
    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    /** @return BelongsTo<ServiceType, $this> */
    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }

    /** @return BelongsTo<WorkOrder, $this> */
    public function lastWorkOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'last_work_order_id');
    }

    /** @return HasMany<MaintenanceAlert, $this> */
    public function alerts(): HasMany
    {
        return $this->hasMany(MaintenanceAlert::class, 'vehicle_id', 'vehicle_id');
    }

    /** @return HasOne<MaintenanceAlert, $this> */
    public function latestAlert(): HasOne
    {
        return $this->hasOne(MaintenanceAlert::class, 'vehicle_id', 'vehicle_id')
            ->latestOfMany();
    }
}
