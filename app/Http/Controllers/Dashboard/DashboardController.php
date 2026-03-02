<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\WorkOrder;
use App\Models\WorkOrderPayment;
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
        $stats = Cache::remember('dashboard_stats', 120, function () {
            $now = Carbon::now('America/Lima');
            $startOfMonth = $now->copy()->startOfMonth();
            $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
            $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

            $activeStatuses = ['ingreso', 'en_checklist', 'diagnosticado', 'en_reparacion', 'listo_para_entregar'];

            // Revenue del mes (pagos cobrados)
            $revenueThisMonth = WorkOrderPayment::query()
                ->whereBetween('paid_at', [$startOfMonth, $now])
                ->sum('amount');

            $revenueLastMonth = WorkOrderPayment::query()
                ->whereBetween('paid_at', [$startOfLastMonth, $endOfLastMonth])
                ->sum('amount');

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
            );
        });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'can' => [
                'view_work_orders' => $request->user()?->can('work_orders.view'),
                'view_clients' => $request->user()?->can('clients.view'),
                'view_products' => $request->user()?->can('products.view'),
            ],
        ]);
    }
}
