<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ProductRepository
{
    private const SORTABLE_COLUMNS = ['name', 'sale_price', 'purchase_price', 'stock', 'status', 'created_at'];

    /**
     * Construye la query base de productos con todos los filtros aplicados.
     * Compartida entre ProductController::index() y ProductsExport.
     */
    public function filteredQuery(Request $request): Builder
    {
        $query = Product::query()
            ->with([
                'inventoryBrand:id,name,inventory_type_id',
                'inventoryBrand.inventoryType:id,name',
                'keywords:id,name',
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name',
            ]);

        $this->applySearch($query, $request->input('search'));
        $this->applyStatusFilter($query, $request->input('filter_status', 'all'));
        $this->applyTypeFilter($query, $request->input('filter_type_id'));
        $this->applyBrandFilter($query, $request->input('filter_brand_id'));
        $this->applySorting($query, $request->input('sort_by', 'name'), $request->input('sort_dir', 'asc'));

        return $query;
    }

    private function applySearch(Builder $query, ?string $search): void
    {
        if ($search === null || $search === '') {
            return;
        }

        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', '%'.$search.'%')
                ->orWhere('description', 'like', '%'.$search.'%')
                ->orWhereHas('keywords', fn ($q) => $q->where('name', 'like', '%'.$search.'%'))
                ->orWhereHas('inventoryBrand', fn ($q) => $q->where('name', 'like', '%'.$search.'%'));
        });
    }

    private function applyStatusFilter(Builder $query, string $filterStatus): void
    {
        if ($filterStatus === 'active') {
            $query->where('status', 'active');
        } elseif ($filterStatus === 'inactive') {
            $query->where('status', 'inactive');
        }
    }

    private function applyTypeFilter(Builder $query, mixed $filterTypeId): void
    {
        if ($filterTypeId !== null && $filterTypeId !== '') {
            $query->whereHas('inventoryBrand', fn ($q) => $q->where('inventory_type_id', (int) $filterTypeId));
        }
    }

    private function applyBrandFilter(Builder $query, mixed $filterBrandId): void
    {
        if ($filterBrandId !== null && $filterBrandId !== '') {
            $query->where('inventory_brand_id', (int) $filterBrandId);
        }
    }

    private function applySorting(Builder $query, string $sortBy, string $sortDir): void
    {
        if (in_array($sortBy, self::SORTABLE_COLUMNS, true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('name');
        }
    }
}
