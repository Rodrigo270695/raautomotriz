<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
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
        'sale_price',
        'purchase_price',
        'stock',
        'image',
        'inventory_brand_id',
        'status',
        'created_by_id',
        'updated_by_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sale_price' => 'decimal:2',
        'purchase_price' => 'decimal:2',
    ];

    /**
     * @var list<string>
     */
    protected $appends = ['image_url'];

    /**
     * URL pública de la imagen (ruta relativa para que cargue en cualquier origen).
     */
    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }
        return '/storage/'.ltrim($this->image, '/');
    }

    /**
     * @return BelongsTo<InventoryBrand, $this>
     */
    public function inventoryBrand(): BelongsTo
    {
        return $this->belongsTo(InventoryBrand::class);
    }

    /**
     * @return BelongsToMany<Keyword, $this>
     */
    public function keywords(): BelongsToMany
    {
        return $this->belongsToMany(Keyword::class, 'product_keyword');
    }

    /**
     * Usuario que registró el producto (trazabilidad).
     *
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /**
     * Usuario que modificó por última vez (trazabilidad).
     *
     * @return BelongsTo<User, $this>
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_id');
    }
}
