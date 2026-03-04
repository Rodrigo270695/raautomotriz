<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleMaintenanceSchedule;
use App\Models\WorkOrder;
use App\Models\WorkOrderPayment;
use App\Models\WorkOrderService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Panel solo para rol cliente: datos únicamente del cliente.
        if ($user && $user->hasRole('cliente')) {
            return $this->clientDashboard($user);
        }

        // Panel de control para staff (admin, técnico, recepcionista, etc.).
        $request->user()?->can('dashboard.view') || abort(403);

        $stats = Cache::remember('dashboard_stats', 120, function () {
            $now = Carbon::now('America/Lima');
            $startOfMonth = $now->copy()->startOfMonth();
            $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
            $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

            $activeStatuses = ['ingreso', 'en_checklist', 'diagnosticado', 'en_reparacion', 'listo_para_entregar'];

            // Revenue del mes (pagos cobrados) — rango en zona horaria Perú, comparado con paid_at en UTC
            $revenueThisMonth = WorkOrderPayment::query()
                ->whereBetween('paid_at', [
                    $startOfMonth->copy()->setTimezone('UTC'),
                    $now->copy()->setTimezone('UTC'),
                ])
                ->sum('amount');

            $revenueLastMonth = WorkOrderPayment::query()
                ->whereBetween('paid_at', [
                    $startOfLastMonth->copy()->setTimezone('UTC'),
                    $endOfLastMonth->copy()->endOfDay()->setTimezone('UTC'),
                ])
                ->sum('amount');

            // Órdenes con al menos un cobro en el mes (para ticket promedio)
            $ordersPaidThisMonth = (int) WorkOrderPayment::query()
                ->whereNotNull('paid_at')
                ->whereBetween('paid_at', [
                    $startOfMonth->copy()->setTimezone('UTC'),
                    $now->copy()->setTimezone('UTC'),
                ])
                ->selectRaw('COUNT(DISTINCT work_order_id) as n')
                ->value('n');
            $averageTicketThisMonth = $ordersPaidThisMonth > 0
                ? round($revenueThisMonth / $ordersPaidThisMonth, 2)
                : 0.0;

            // Ingresos YTD (año en curso vs mismo periodo año anterior), zona Perú
            $startOfYear = $now->copy()->startOfYear();
            $sameDayLastYear = $now->copy()->subYear();
            $revenueYtd = (float) WorkOrderPayment::query()
                ->whereNotNull('paid_at')
                ->whereBetween('paid_at', [
                    $startOfYear->copy()->setTimezone('UTC'),
                    $now->copy()->setTimezone('UTC'),
                ])
                ->sum('amount');
            $revenueYtdLastYear = (float) WorkOrderPayment::query()
                ->whereNotNull('paid_at')
                ->whereBetween('paid_at', [
                    $sameDayLastYear->copy()->startOfYear()->setTimezone('UTC'),
                    $sameDayLastYear->copy()->setTimezone('UTC'),
                ])
                ->sum('amount');

            // Vehículos registrados este mes
            $vehiclesRegisteredThisMonth = Vehicle::query()
                ->whereDate('created_at', '>=', $startOfMonth)
                ->count();

            // Órdenes entregadas y canceladas este mes (por updated_at)
            $ordersDeliveredThisMonth = WorkOrder::query()
                ->where('status', 'entregado')
                ->whereDate('updated_at', '>=', $startOfMonth)
                ->whereDate('updated_at', '<=', $now)
                ->count();
            $ordersCancelledThisMonth = WorkOrder::query()
                ->where('status', 'cancelado')
                ->whereDate('updated_at', '>=', $startOfMonth)
                ->whereDate('updated_at', '<=', $now)
                ->count();

            // Órdenes activas
            $activeOrders = WorkOrder::query()->whereIn('status', $activeStatuses)->count();

            // Órdenes del mes
            $ordersThisMonth = WorkOrder::query()
                ->whereDate('entry_date', '>=', $startOfMonth)
                ->count();

            $ordersLastMonth = WorkOrder::query()
                ->whereDate('entry_date', '>=', $startOfLastMonth)
                ->whereDate('entry_date', '<=', $endOfLastMonth)
                ->count();

            // Clientes nuevos del mes
            $newClientsThisMonth = User::query()
                ->whereHas('roles', fn ($q) => $q->where('name', 'cliente'))
                ->whereDate('created_at', '>=', $startOfMonth)
                ->count();

            // Distribución por estado
            $statusCounts = WorkOrder::query()
                ->select('status', DB::raw('COUNT(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status')
                ->toArray();

            $statusLabels = [
                'ingreso' => 'Ingreso',
                'en_checklist' => 'En checklist',
                'diagnosticado' => 'Diagnosticado',
                'en_reparacion' => 'En reparación',
                'listo_para_entregar' => 'Listo para entregar',
                'entregado' => 'Entregado',
                'cancelado' => 'Cancelado',
            ];

            $statusDistribution = collect($statusLabels)
                ->map(fn ($label, $key) => [
                    'status' => $key,
                    'label' => $label,
                    'count' => $statusCounts[$key] ?? 0,
                    'active' => in_array($key, $activeStatuses, true),
                ])
                ->values();

            // Valor total del inventario
            $inventoryValue = Product::query()
                ->where('status', 'active')
                ->sum(DB::raw('COALESCE(purchase_price, 0) * COALESCE(stock, 0)'));

            // Productos con stock crítico (≤ 5)
            $lowStockProducts = Product::query()
                ->where('status', 'active')
                ->where('stock', '<=', 5)
                ->with('inventoryBrand:id,name')
                ->orderBy('stock')
                ->limit(8)
                ->get(['id', 'name', 'stock', 'inventory_brand_id'])
                ->map(fn (Product $p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'brand_name' => $p->inventoryBrand?->name,
                    'stock' => (int) $p->stock,
                ]);

            // Últimas 6 órdenes
            $recentOrders = WorkOrder::query()
                ->with(['vehicle:id,plate', 'client:id,first_name,last_name'])
                ->orderBy('entry_date', 'desc')
                ->orderBy('id', 'desc')
                ->limit(6)
                ->get()
                ->map(fn (WorkOrder $wo) => [
                    'id' => $wo->id,
                    'status' => $wo->status,
                    'entry_date' => $wo->entry_date,
                    'total_amount' => (float) $wo->total_amount,
                    'plate' => $wo->vehicle?->plate ?? '—',
                    'client_name' => $wo->client
                        ? trim($wo->client->first_name.' '.$wo->client->last_name)
                        : '—',
                ]);

            // Totales generales
            $totalClients = User::query()
                ->whereHas('roles', fn ($q) => $q->where('name', 'cliente'))
                ->count();
            $totalVehicles = Vehicle::count();

            // Cuentas por cobrar: total pendiente (órdenes no canceladas con saldo > 0)
            $accountsReceivableRows = WorkOrder::query()
                ->where('status', '!=', 'cancelado')
                ->where('total_amount', '>', 0)
                ->withSum('payments', 'amount')
                ->get(['id', 'total_amount', 'payments_sum_amount']);
            $accountsReceivableTotal = round(
                $accountsReceivableRows->sum(fn ($wo) => max(0, (float) $wo->total_amount - (float) ($wo->payments_sum_amount ?? 0))),
                2
            );
            $accountsReceivableOrdersCount = $accountsReceivableRows->filter(
                fn ($wo) => (float) $wo->total_amount > (float) ($wo->payments_sum_amount ?? 0)
            )->count();

            // Evolutivo diario: ingresos al taller por día (mes actual vs mes anterior), zona Perú
            $currentMonth = $now->month;
            $currentYear = $now->year;
            $prevMonthDate = $now->copy()->subMonth();
            $prevMonth = $prevMonthDate->month;
            $prevYear = $prevMonthDate->year;
            $daysInCurrentMonth = $now->daysInMonth;
            $daysInPrevMonth = $prevMonthDate->daysInMonth;
            $dailyComparison = [];
            for ($day = 1; $day <= 31; $day++) {
                $currentMonthCount = 0;
                $previousMonthCount = 0;
                if ($day <= $daysInCurrentMonth) {
                    $currentMonthCount = WorkOrder::query()
                        ->whereYear('entry_date', $currentYear)
                        ->whereMonth('entry_date', $currentMonth)
                        ->whereDay('entry_date', $day)
                        ->count();
                }
                if ($day <= $daysInPrevMonth) {
                    $previousMonthCount = WorkOrder::query()
                        ->whereYear('entry_date', $prevYear)
                        ->whereMonth('entry_date', $prevMonth)
                        ->whereDay('entry_date', $day)
                        ->count();
                }
                $dailyComparison[] = [
                    'day' => $day,
                    'current_month_count' => $currentMonthCount,
                    'previous_month_count' => $previousMonthCount,
                ];
            }
            $currentMonthLabel = $now->locale('es')->translatedFormat('F Y'); // ej. "marzo 2026"
            $previousMonthLabel = $prevMonthDate->locale('es')->translatedFormat('F Y');

            // Ingresos por día (económicos) en zona horaria Perú: paid_at se interpreta en America/Lima
            $dailyRevenueComparison = [];
            $tz = 'America/Lima';
            for ($day = 1; $day <= 31; $day++) {
                $currentMonthAmount = 0.0;
                $previousMonthAmount = 0.0;
                if ($day <= $daysInCurrentMonth) {
                    $dayStart = Carbon::create($currentYear, $currentMonth, $day, 0, 0, 0, $tz)->startOfDay();
                    $dayEnd = $dayStart->copy()->endOfDay();
                    $currentMonthAmount = (float) WorkOrderPayment::query()
                        ->whereNotNull('paid_at')
                        ->whereBetween('paid_at', [$dayStart->copy()->setTimezone('UTC'), $dayEnd->copy()->setTimezone('UTC')])
                        ->sum('amount');
                }
                if ($day <= $daysInPrevMonth) {
                    $dayStartPrev = Carbon::create($prevYear, $prevMonth, $day, 0, 0, 0, $tz)->startOfDay();
                    $dayEndPrev = $dayStartPrev->copy()->endOfDay();
                    $previousMonthAmount = (float) WorkOrderPayment::query()
                        ->whereNotNull('paid_at')
                        ->whereBetween('paid_at', [$dayStartPrev->copy()->setTimezone('UTC'), $dayEndPrev->copy()->setTimezone('UTC')])
                        ->sum('amount');
                }
                $dailyRevenueComparison[] = [
                    'day' => $day,
                    'current_month_amount' => round($currentMonthAmount, 2),
                    'previous_month_amount' => round($previousMonthAmount, 2),
                ];
            }

            // Ingresos por tipo de servicio (mes actual): órdenes con al menos un pago en el mes, suma subtotal por tipo
            $orderIdsPaidThisMonth = WorkOrderPayment::query()
                ->whereNotNull('paid_at')
                ->whereBetween('paid_at', [
                    $startOfMonth->copy()->setTimezone('UTC'),
                    $now->copy()->setTimezone('UTC'),
                ])
                ->distinct()
                ->pluck('work_order_id');
            $revenueByServiceTypeThisMonth = collect([]);
            if ($orderIdsPaidThisMonth->isNotEmpty()) {
                $revenueByServiceTypeThisMonth = WorkOrderService::query()
                    ->whereIn('work_order_id', $orderIdsPaidThisMonth->all())
                    ->leftJoin('service_packages', 'work_order_services.service_package_id', '=', 'service_packages.id')
                    ->leftJoin('service_types', 'service_packages.service_type_id', '=', 'service_types.id')
                    ->selectRaw("COALESCE(service_types.name, 'Otros') as type_name, COALESCE(SUM(work_order_services.subtotal), 0) as total")
                    ->groupBy(DB::raw("COALESCE(service_types.name, 'Otros')"))
                    ->orderByDesc('total')
                    ->get()
                    ->map(fn ($row) => ['name' => $row->type_name, 'value' => round((float) $row->total, 2)])
                    ->values()
                    ->all();
            }

            // Últimos 12 meses: órdenes por mes (entry_date)
            $ordersByMonthLast12 = [];
            for ($i = 11; $i >= 0; $i--) {
                $d = $now->copy()->subMonths($i);
                $monthStart = $d->copy()->startOfMonth();
                $monthEnd = $d->copy()->endOfMonth();
                $count = WorkOrder::query()
                    ->whereDate('entry_date', '>=', $monthStart)
                    ->whereDate('entry_date', '<=', $monthEnd)
                    ->count();
                $ordersByMonthLast12[] = [
                    'month' => $d->month,
                    'year' => $d->year,
                    'label' => $d->locale('es')->translatedFormat('M y'),
                    'count' => $count,
                ];
            }

            // Últimos 12 meses: ingresos por mes (paid_at, zona Perú)
            $revenueByMonthLast12 = [];
            for ($i = 11; $i >= 0; $i--) {
                $d = $now->copy()->subMonths($i);
                $monthStart = $d->copy()->startOfMonth()->setTimezone('UTC');
                $monthEnd = $d->copy()->endOfMonth()->endOfDay()->setTimezone('UTC');
                $amount = (float) WorkOrderPayment::query()
                    ->whereNotNull('paid_at')
                    ->whereBetween('paid_at', [$monthStart, $monthEnd])
                    ->sum('amount');
                $revenueByMonthLast12[] = [
                    'month' => $d->month,
                    'year' => $d->year,
                    'label' => $d->locale('es')->translatedFormat('M y'),
                    'amount' => round($amount, 2),
                ];
            }

            // Últimos 12 meses: vehículos registrados por mes
            $vehiclesByMonthLast12 = [];
            for ($i = 11; $i >= 0; $i--) {
                $d = $now->copy()->subMonths($i);
                $monthStart = $d->copy()->startOfMonth();
                $monthEnd = $d->copy()->endOfMonth();
                $count = Vehicle::query()
                    ->whereDate('created_at', '>=', $monthStart)
                    ->whereDate('created_at', '<=', $monthEnd)
                    ->count();
                $vehiclesByMonthLast12[] = [
                    'month' => $d->month,
                    'year' => $d->year,
                    'label' => $d->locale('es')->translatedFormat('M y'),
                    'count' => $count,
                ];
            }

            return compact(
                'activeOrders',
                'revenueThisMonth',
                'revenueLastMonth',
                'ordersThisMonth',
                'ordersLastMonth',
                'newClientsThisMonth',
                'statusDistribution',
                'inventoryValue',
                'lowStockProducts',
                'recentOrders',
                'totalClients',
                'totalVehicles',
                'accountsReceivableTotal',
                'accountsReceivableOrdersCount',
                'dailyComparison',
                'dailyRevenueComparison',
                'currentMonthLabel',
                'previousMonthLabel',
                'ordersPaidThisMonth',
                'averageTicketThisMonth',
                'vehiclesRegisteredThisMonth',
                'ordersDeliveredThisMonth',
                'ordersCancelledThisMonth',
                'revenueYtd',
                'revenueYtdLastYear',
                'revenueByServiceTypeThisMonth',
                'ordersByMonthLast12',
                'revenueByMonthLast12',
                'vehiclesByMonthLast12',
            );
        });

        // Visitas al taller en los próximos 7 días (siempre fresco, sin cache)
        $now = Carbon::now('America/Lima');
        $today = $now->copy()->startOfDay();
        $inSevenDays = $now->copy()->addDays(7)->endOfDay();
        $upcomingVisits = VehicleMaintenanceSchedule::query()
            ->whereNotNull('next_due_date')
            ->whereBetween('next_due_date', [$today, $inSevenDays])
            ->with([
                'vehicle:id,plate,client_id,vehicle_model_id',
                'vehicle.client:id,first_name,last_name',
                'vehicle.vehicleModel:id,name,brand_id',
                'vehicle.vehicleModel.brand:id,name',
                'servicePackage:id,name',
                'serviceType:id,name',
            ])
            ->orderBy('next_due_date')
            ->limit(12)
            ->get()
            ->map(function (VehicleMaintenanceSchedule $s) {
                $vehicle = $s->vehicle;
                $clientName = $vehicle && $vehicle->client
                    ? trim($vehicle->client->first_name . ' ' . $vehicle->client->last_name)
                    : '—';
                $vehicleDisplay = $vehicle && $vehicle->vehicleModel
                    ? trim(($vehicle->vehicleModel->brand?->name ?? '') . ' ' . ($vehicle->vehicleModel->name ?? ''))
                    : '—';
                $serviceLabel = $s->servicePackage?->name ?? $s->serviceType?->name ?? 'Mantenimiento';
                return [
                    'id' => $s->id,
                    'next_due_date' => $s->next_due_date ? $s->next_due_date->format('Y-m-d') : null,
                    'plate' => $vehicle?->plate ?? '—',
                    'vehicle_display' => $vehicleDisplay,
                    'client_name' => $clientName,
                    'service_label' => $serviceLabel,
                ];
            })
            ->all();

        return Inertia::render('dashboard', [
            'isClientDashboard' => false,
            'stats' => $stats,
            'upcomingVisits' => $upcomingVisits,
            'can' => [
                'view_work_orders' => $request->user()?->can('work_orders.view'),
                'view_clients' => $request->user()?->can('clients.view'),
                'view_products' => $request->user()?->can('products.view'),
                'view_financial' => $request->user()?->can('dashboard.view_financial'),
                'view_maintenance_schedules' => $request->user()?->can('maintenance_schedules.view'),
                'view_accounts_receivable' => $request->user()?->can('accounts_receivable.view'),
            ],
        ]);
    }

    /**
     * Panel de control para el rol cliente: solo datos del cliente (sus órdenes).
     */
    private function clientDashboard(User $user): Response
    {
        $activeStatuses = ['ingreso', 'en_checklist', 'diagnosticado', 'en_reparacion', 'listo_para_entregar'];

        $clientOrdersQuery = WorkOrder::query()->where('client_id', $user->id);

        $activeOrders = (clone $clientOrdersQuery)->whereIn('status', $activeStatuses)->count();

        $statusCounts = (clone $clientOrdersQuery)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $statusLabels = [
            'ingreso' => 'Ingreso',
            'en_checklist' => 'En checklist',
            'diagnosticado' => 'Diagnosticado',
            'en_reparacion' => 'En reparación',
            'listo_para_entregar' => 'Listo para entregar',
            'entregado' => 'Entregado',
            'cancelado' => 'Cancelado',
        ];

        $statusDistribution = collect($statusLabels)
            ->map(fn ($label, $key) => [
                'status' => $key,
                'label' => $label,
                'count' => $statusCounts[$key] ?? 0,
                'active' => in_array($key, $activeStatuses, true),
            ])
            ->values()
            ->all();

        $recentOrders = WorkOrder::query()
            ->where('client_id', $user->id)
            ->with(['vehicle:id,plate', 'client:id,first_name,last_name'])
            ->orderBy('entry_date', 'desc')
            ->orderBy('id', 'desc')
            ->limit(6)
            ->get()
            ->map(fn (WorkOrder $wo) => [
                'id' => $wo->id,
                'status' => $wo->status,
                'entry_date' => $wo->entry_date,
                'total_amount' => (float) $wo->total_amount,
                'plate' => $wo->vehicle?->plate ?? '—',
                'vehicle_display' => $wo->vehicle && $wo->vehicle->vehicleModel
                    ? trim(($wo->vehicle->vehicleModel->brand?->name ?? '') . ' ' . ($wo->vehicle->vehicleModel->name ?? ''))
                    : '—',
                'show_url' => route('dashboard.my-orders.show', ['work_order' => $wo->id]),
            ])
            ->all();

        $vehiclesCount = $user->vehicles()->count();

        return Inertia::render('dashboard', [
            'isClientDashboard' => true,
            'clientStats' => [
                'activeOrders' => $activeOrders,
                'vehiclesCount' => $vehiclesCount,
                'statusDistribution' => $statusDistribution,
                'recentOrders' => $recentOrders,
            ],
            'can' => [
                'view_work_orders' => false,
                'view_clients' => false,
                'view_products' => false,
            ],
        ]);
    }
}
