<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderPhoto extends Model
{
    use HasFactory;

    public const TYPE_ENTRY = 'entry';
    public const TYPE_DIAGNOSIS = 'diagnosis';
    public const TYPE_PROCESS = 'process';
    public const TYPE_DELIVERY = 'delivery';

    /** @var list<string> */
    public static array $types = [
        self::TYPE_ENTRY => 'Ingreso',
        self::TYPE_DIAGNOSIS => 'Diagnóstico',
        self::TYPE_PROCESS => 'Avance / reparación',
        self::TYPE_DELIVERY => 'Entrega',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'work_order_id',
        'type',
        'path',
        'caption',
    ];

    /**
     * @return BelongsTo<WorkOrder, $this>
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /** URL pública del archivo (ruta relativa para que cargue en cualquier dominio/puerto). */
    public function getUrlAttribute(): string
    {
        return '/storage/'.ltrim($this->path ?? '', '/');
    }
}
