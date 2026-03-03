<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceAlert extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'vehicle_id',
        'user_id',
        'service_package_id',
        'service_type_id',
        'type',
        'scheduled_at',
        'sent_at',
        'notification_log_id',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at'      => 'datetime',
    ];

    /** @return BelongsTo<Vehicle, $this> */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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

    /** @return BelongsTo<NotificationLog, $this> */
    public function notificationLog(): BelongsTo
    {
        return $this->belongsTo(NotificationLog::class);
    }
}
