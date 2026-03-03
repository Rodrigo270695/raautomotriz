<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServicePackage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'service_type_id',
        'status',
        'sort_order',
        'interval_km',
        'interval_days',
    ];

    /** @var array<string, string> */
    protected $casts = [
        'interval_km'   => 'integer',
        'interval_days' => 'integer',
    ];

    /**
     * @return BelongsTo<ServiceType, $this>
     */
    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }

    /**
     * @return HasMany<ServicePackageItem>
     */
    public function items(): HasMany
    {
        return $this->hasMany(ServicePackageItem::class);
    }
}
