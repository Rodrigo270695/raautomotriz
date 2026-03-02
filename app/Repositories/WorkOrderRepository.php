<?php

namespace App\Repositories;

use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class WorkOrderRepository
{
    private const SORTABLE_COLUMNS = ['id', 'entry_date', 'entry_time', 'status', 'total_amount', 'created_at'];

    public function paginatedList(Request $request): LengthAwarePaginator
    {
        $query = WorkOrder::query()
            ->with(['vehicle:id,plate,vehicle_model_id', 'vehicle.vehicleModel:id,name', 'client:id,first_name,last_name'])
            ->withSum('payments', 'amount');

        $this->applySearch($query, $request->input('search'));
        $this->applyStatusFilter($query, $request->input('filter_status', 'all'));
        $this->applyDateFilter($query, $request->input('date_from'), $request->input('date_to'));
        $this->applySorting($query, $request->input('sort_by', 'entry_date'), $request->input('sort_dir', 'desc'));

        return $query->paginate($request->input('per_page', 10))->withQueryString();
    }

    public function filteredQuery(Request $request): \Illuminate\Database\Eloquent\Builder
    {
        $query = WorkOrder::query()
            ->with(['vehicle:id,plate,vehicle_model_id', 'vehicle.vehicleModel:id,name', 'client:id,first_name,last_name'])
            ->withSum('payments', 'amount');

        $this->applySearch($query, $request->input('search'));
        $this->applyStatusFilter($query, $request->input('filter_status', 'all'));
        $this->applyDateFilter($query, $request->input('date_from'), $request->input('date_to'));
        $this->applySorting($query, $request->input('sort_by', 'entry_date'), $request->input('sort_dir', 'desc'));

        return $query;
    }

    /**
     * @return array<string, mixed>
     */
    public function getFiltersFromRequest(Request $request): array
    {
        return [
            'search' => $request->input('search'),
            'per_page' => $request->input('per_page', 10),
            'sort_by' => $request->input('sort_by', 'entry_date'),
            'sort_dir' => $request->input('sort_dir', 'desc'),
            'filter_status' => $request->input('filter_status', 'all'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ];
    }

    private function applySearch(\Illuminate\Database\Eloquent\Builder $query, ?string $search): void
    {
        if ($search === null || $search === '') {
            return;
        }

        $query->where(function ($q) use ($search) {
            $q->whereHas('vehicle', fn ($v) => $v->where('plate', 'like', '%'.$search.'%'))
                ->orWhereHas('client', fn ($c) => $c->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%'));
        });
    }

    private function applyStatusFilter(\Illuminate\Database\Eloquent\Builder $query, string $filterStatus): void
    {
        if ($filterStatus !== 'all') {
            $query->where('status', $filterStatus);
        }
    }

    private function applyDateFilter(\Illuminate\Database\Eloquent\Builder $query, ?string $dateFrom, ?string $dateTo): void
    {
        if ($dateFrom !== null && $dateFrom !== '') {
            $query->whereDate('entry_date', '>=', $dateFrom);
        }
        if ($dateTo !== null && $dateTo !== '') {
            $query->whereDate('entry_date', '<=', $dateTo);
        }
    }

    private function applySorting(\Illuminate\Database\Eloquent\Builder $query, string $sortBy, string $sortDir): void
    {
        $sortDir = in_array($sortDir, ['asc', 'desc'], true) ? $sortDir : 'desc';

        if (! in_array($sortBy, self::SORTABLE_COLUMNS, true)) {
            $query->orderBy('entry_date', 'desc')->orderBy('entry_time', 'desc')->orderBy('id', 'desc');

            return;
        }

        if ($sortBy === 'entry_date') {
            $query->orderBy('entry_date', $sortDir)->orderBy('entry_time', $sortDir)->orderBy('id', $sortDir);
        } else {
            $query->orderBy($sortBy, $sortDir);
        }
    }
}
