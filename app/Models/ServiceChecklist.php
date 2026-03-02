<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceChecklist extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_number',
        'name',
        'description',
        'status',
    ];

    /**
     * @return HasMany<WorkOrderChecklistResult, $this>
     */
    public function results(): HasMany
    {
        return $this->hasMany(WorkOrderChecklistResult::class);
    }
}
