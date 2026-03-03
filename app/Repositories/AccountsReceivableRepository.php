<?php

namespace App\Repositories;

use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AccountsReceivableRepository
{
    private const SORTABLE_COLUMNS = ['id', 'entry_date', 'total_amount', 'pending_amount', 'status'];

    public function paginatedList(Request $request): LengthAwarePaginator
    {
        $query = $this->baseQuery();
        $this->applyFilters($query, $request);

        return $query->paginate($request->input('per_page', 10))->withQueryString();
    }

    public function filteredQuery(Request $request): Builder
    {
        $query = $this->baseQuery();
        $this->applyFilters($query, $request);

        return $query;
    }

    /**
     * @return array{
     *     total_orders: int,
     *     total_pending: float
     * }
     */
    public function stats(Request $request): array
    {
        $query = $this->baseQuery();
        $this->applyFilters($query, $request);

        $rows = $query->get(['total_amount', 'payments_sum_amount']);

        $totalPending = $rows->sum(fn ($wo) => max(0, (float) $wo->total_amount - (float) ($wo->payments_sum_amount ?? 0)));

        return [
            'total_orders'  => $rows->count(),
            'total_pending' => round($totalPending, 2),
        ];
    }

    /**
     * Resumen agrupado por cliente: nombre, total órdenes, total facturado, total pagado, total pendiente.
     * Se aplica el mismo filtro de búsqueda para poder filtrar por cliente.
     *
     * @return Collection<int, object>
     */
    public function clientSummary(?string $search = null): Collection
    {
        $query = DB::table('work_orders as wo')
            ->join('users as u', 'u.id', '=', 'wo.client_id')
            ->leftJoin(
                DB::raw('(SELECT work_order_id, SUM(amount) as paid FROM work_order_payments GROUP BY work_order_id) as p'),
                'p.work_order_id', '=', 'wo.id'
            )
            ->where('wo.status', '!=', 'cancelado')
            ->where('wo.total_amount', '>', 0)
            ->whereRaw('wo.total_amount > COALESCE(p.paid, 0)')
            ->groupBy('wo.client_id', 'u.id', 'u.first_name', 'u.last_name', 'u.email', 'u.phone')
            ->select([
                'wo.client_id',
                DB::raw("CONCAT(u.first_name, ' ', u.last_name) as client_name"),
                'u.email as client_email',
                'u.phone as client_phone',
                DB::raw('COUNT(wo.id) as orders_count'),
                DB::raw('SUM(wo.total_amount) as total_amount'),
                DB::raw('SUM(COALESCE(p.paid, 0)) as total_paid'),
                DB::raw('SUM(wo.total_amount - COALESCE(p.paid, 0)) as total_pending'),
            ])
            ->orderByDesc('total_pending');

        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('u.first_name', 'like', '%'.$search.'%')
                    ->orWhere('u.last_name', 'like', '%'.$search.'%');
            });
        }

        return $query->get();
    }

    /**
     * @return array<string, mixed>
     */
    public function getFiltersFromRequest(Request $request): array
    {
        return [
            'search'         => $request->input('search'),
            'per_page'       => $request->input('per_page', 10),
            'sort_by'        => $request->input('sort_by', 'entry_date'),
            'sort_dir'       => $request->input('sort_dir', 'desc'),
            'filter_status'  => $request->input('filter_status', 'all'),
            'date_from'      => $request->input('date_from'),
            'date_to'        => $request->input('date_to'),
        ];
    }

    private function baseQuery(): Builder
    {
        return WorkOrder::query()
            ->with(['vehicle:id,plate,vehicle_model_id', 'vehicle.vehicleModel:id,name', 'client:id,first_name,last_name,phone'])
            ->withSum('payments', 'amount')
            ->whereRaw('total_amount > COALESCE((SELECT SUM(amount) FROM work_order_payments WHERE work_order_payments.work_order_id = work_orders.id), 0)')
            ->where('total_amount', '>', 0)
            ->where('status', '!=', 'cancelado');
    }

    private function applyFilters(Builder $query, Request $request): void
    {
        $this->applySearch($query, $request->input('search'));
        $this->applyStatusFilter($query, $request->input('filter_status', 'all'));
        $this->applyDateFilter($query, $request->input('date_from'), $request->input('date_to'));
        $this->applySorting($query, $request->input('sort_by', 'entry_date'), $request->input('sort_dir', 'desc'));
    }

    private function applySearch(Builder $query, ?string $search): void
    {
        if ($search === null || $search === '') {
            return;
        }
        $query->where(function (Builder $q) use ($search) {
            $q->whereHas('vehicle', fn ($v) => $v->where('plate', 'like', '%'.$search.'%'))
                ->orWhereHas('client', fn ($c) => $c->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%'));
        });
    }

    private function applyStatusFilter(Builder $query, string $filterStatus): void
    {
        if ($filterStatus !== 'all') {
            $query->where('status', $filterStatus);
        }
    }

    private function applyDateFilter(Builder $query, ?string $dateFrom, ?string $dateTo): void
    {
        if ($dateFrom !== null && $dateFrom !== '') {
            $query->whereDate('entry_date', '>=', $dateFrom);
        }
        if ($dateTo !== null && $dateTo !== '') {
            $query->whereDate('entry_date', '<=', $dateTo);
        }
    }

    private function applySorting(Builder $query, string $sortBy, string $sortDir): void
    {
        $sortDir = in_array($sortDir, ['asc', 'desc'], true) ? $sortDir : 'desc';

        if ($sortBy === 'pending_amount') {
            $query->orderByRaw(
                'total_amount - COALESCE((SELECT SUM(amount) FROM work_order_payments WHERE work_order_payments.work_order_id = work_orders.id), 0) '.$sortDir
            );

            return;
        }

        if (! in_array($sortBy, self::SORTABLE_COLUMNS, true)) {
            $query->orderBy('entry_date', 'desc')->orderBy('id', 'desc');

            return;
        }

        if ($sortBy === 'entry_date') {
            $query->orderBy('entry_date', $sortDir)->orderBy('id', $sortDir);
        } else {
            $query->orderBy($sortBy, $sortDir);
        }
    }
}
