<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderService extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'work_order_id',
        'service_package_id',
        'service_package_item_id',
        'product_id',
        'description',
        'quantity',
        'unit_price',
        'subtotal',
        'type',
        'stock_deducted_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'stock_deducted_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<WorkOrder, $this>
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * @return BelongsTo<ServicePackage, $this>
     */
    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    /**
     * @return BelongsTo<ServicePackageItem, $this>
     */
    public function servicePackageItem(): BelongsTo
    {
        return $this->belongsTo(ServicePackageItem::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

