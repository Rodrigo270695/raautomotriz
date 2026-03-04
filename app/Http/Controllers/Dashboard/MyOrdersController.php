<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\VehicleMaintenanceSchedule;
use App\Models\WorkOrder;
use App\Models\WorkOrderPhoto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyOrdersController extends Controller
{
    /**
     * Listado de órdenes del cliente actual (abiertas: no entregadas ni canceladas).
     */
    public function index(Request $request): Response
    {
        $request->user()?->can('my_orders.view') || abort(403);

        $query = WorkOrder::query()
            ->where('client_id', $request->user()->id)
            ->whereNotIn('status', ['entregado', 'cancelado'])
            ->with(['vehicle.vehicleModel.brand'])
            ->orderByDesc('updated_at');

        $workOrders = $query->paginate(20)->withQueryString();

        $items = $workOrders->getCollection()->map(fn (WorkOrder $wo) => [
            'id' => $wo->id,
            'entry_date' => $wo->entry_date?->format('Y-m-d'),
            'entry_time' => $wo->entry_time,
            'status' => $wo->status,
            'vehicle_plate' => $wo->vehicle?->plate,
            'vehicle_display' => $wo->vehicle && $wo->vehicle->vehicleModel
                ? trim(($wo->vehicle->vehicleModel->brand?->name ?? '') . ' ' . ($wo->vehicle->vehicleModel->name ?? ''))
                : '—',
            'show_url' => route('dashboard.my-orders.show', ['work_order' => $wo->id]),
        ]);

        return Inertia::render('my-orders/index', [
            'workOrders' => [
                'data' => $items,
                'current_page' => $workOrders->currentPage(),
                'last_page' => $workOrders->lastPage(),
                'per_page' => $workOrders->perPage(),
                'total' => $workOrders->total(),
            ],
            'indexPath' => route('dashboard.my-orders.index'),
            'title' => 'Mis Órdenes',
            'breadcrumbs' => [
                ['title' => 'Panel de control', 'href' => '/dashboard'],
                ['title' => 'Mis órdenes', 'href' => '#'],
                ['title' => 'Mis Órdenes', 'href' => route('dashboard.my-orders.index')],
            ],
        ]);
    }

    /**
     * Detalle de una orden del cliente (timeline + datos para panel).
     */
    public function show(Request $request, WorkOrder $work_order): Response
    {
        $request->user()?->can('my_orders.view') || abort(403);
        if ((int) $work_order->client_id !== (int) $request->user()->id) {
            abort(404);
        }
        if ($work_order->status === 'cancelado') {
            abort(404);
        }

        $work_order->load([
            'vehicle.vehicleModel.brand',
            'photos',
            'checklistResults.serviceChecklist:id,name,order_number',
            'diagnoses.diagnosedByUser:id,first_name,last_name',
            'services.servicePackage:id,name',
            'services.product.inventoryBrand:id,name',
            'payments',
        ]);

        $localTz = config('app.local_timezone', 'America/Lima');
        $photosByType = [
            'entry' => $work_order->photos->where('type', WorkOrderPhoto::TYPE_ENTRY)->values()->map(fn ($p) => [
                'id' => $p->id,
                'url' => $p->url,
                'caption' => $p->caption,
                'created_at' => $p->created_at?->toIso8601String(),
            ])->all(),
            'diagnosis' => $work_order->photos->where('type', WorkOrderPhoto::TYPE_DIAGNOSIS)->values()->map(fn ($p) => [
                'id' => $p->id,
                'url' => $p->url,
                'caption' => $p->caption,
                'created_at' => $p->created_at?->toIso8601String(),
            ])->all(),
            'process' => $work_order->photos->where('type', WorkOrderPhoto::TYPE_PROCESS)->values()->map(fn ($p) => [
                'id' => $p->id,
                'url' => $p->url,
                'caption' => $p->caption,
                'created_at' => $p->created_at?->toIso8601String(),
            ])->all(),
            'delivery' => $work_order->photos->where('type', WorkOrderPhoto::TYPE_DELIVERY)->values()->map(fn ($p) => [
                'id' => $p->id,
                'url' => $p->url,
                'caption' => $p->caption,
                'created_at' => $p->created_at?->toIso8601String(),
            ])->all(),
        ];

        $checklistResults = $work_order->checklistResults->sortBy(fn ($r) => $r->serviceChecklist?->order_number ?? 999)->values()->map(fn ($r) => [
            'id' => $r->id,
            'name' => $r->serviceChecklist?->name ?? '—',
            'order_number' => $r->serviceChecklist?->order_number,
            'checked' => (bool) $r->checked,
            'note' => $r->note ?? '',
            'completed_at' => $r->completed_at?->toIso8601String(),
        ])->all();

        $diagnoses = $work_order->diagnoses->map(fn ($d) => [
            'id' => $d->id,
            'diagnosis_text' => $d->diagnosis_text,
            'diagnosed_at' => $d->diagnosed_at ? $d->diagnosed_at->setTimezone($localTz)->toIso8601String() : null,
            'diagnosed_by_name' => $d->diagnosedByUser ? trim($d->diagnosedByUser->first_name . ' ' . $d->diagnosedByUser->last_name) : null,
        ])->values()->all();

        $services = $work_order->services->sortBy('id')->values()->map(fn ($s) => [
            'id' => $s->id,
            'service_package_name' => $s->servicePackage?->name,
            'product_name' => $s->product?->name,
            'product_brand_name' => $s->product?->inventoryBrand?->name,
            'description' => $s->description,
            'quantity' => (float) $s->quantity,
            'unit_price' => (float) $s->unit_price,
            'subtotal' => (float) $s->subtotal,
        ])->all();

        $payments = $work_order->payments->sortByDesc('id')->values()->map(fn ($p) => [
            'id' => $p->id,
            'type' => $p->type,
            'amount' => (float) $p->amount,
            'payment_method' => $p->payment_method,
            'paid_at' => $p->paid_at?->toIso8601String(),
            'reference' => $p->reference,
            'print_url' => route('dashboard.services.work-orders.payments.print', ['work_order' => $work_order->id, 'payment' => $p->id]),
            'receipt_pdf_url' => route('dashboard.services.work-orders.payments.receipt-pdf', ['work_order' => $work_order->id, 'payment' => $p->id]),
        ])->all();

        $nextMaintenance = [];
        if ($work_order->status === 'entregado' && $work_order->vehicle_id) {
            $schedules = VehicleMaintenanceSchedule::query()
                ->where('last_work_order_id', $work_order->id)
                ->with('servicePackage:id,name')
                ->get();
            foreach ($schedules as $s) {
                $nextMaintenance[] = [
                    'service_package_name' => $s->servicePackage?->name ?? '—',
                    'next_due_date' => $s->next_due_date?->format('Y-m-d'),
                    'next_due_km' => $s->next_due_km,
                    'interval_days' => $s->interval_days,
                    'interval_km' => $s->interval_km,
                    'last_service_at' => $s->last_service_at?->toIso8601String(),
                    'last_service_mileage' => $s->last_service_mileage,
                ];
            }
        }

        return Inertia::render('my-orders/show', [
            'order' => [
                'id' => $work_order->id,
                'status' => $work_order->status,
                'entry_date' => $work_order->entry_date?->format('Y-m-d'),
                'entry_time' => $work_order->entry_time,
                'entry_mileage' => $work_order->entry_mileage,
                'exit_mileage' => $work_order->exit_mileage,
                'vehicle_plate' => $work_order->vehicle?->plate,
                'vehicle_display' => $work_order->vehicle && $work_order->vehicle->vehicleModel
                    ? trim(($work_order->vehicle->vehicleModel->brand?->name ?? '') . ' ' . ($work_order->vehicle->vehicleModel->name ?? ''))
                    : '—',
                'photos_by_type' => $photosByType,
                'checklist_results' => $checklistResults,
                'diagnoses' => $diagnoses,
                'services' => $services,
                'payments' => $payments,
                'total_amount' => $work_order->total_amount ? (float) $work_order->total_amount : null,
                'next_maintenance' => $nextMaintenance,
            ],
            'breadcrumbs' => [
                ['title' => 'Panel de control', 'href' => '/dashboard'],
                ['title' => 'Mis órdenes', 'href' => '#'],
                ['title' => 'Mis Órdenes', 'href' => route('dashboard.my-orders.index')],
                ['title' => 'Orden #' . $work_order->id, 'href' => route('dashboard.my-orders.show', ['work_order' => $work_order->id])],
            ],
        ]);
    }

    /**
     * Historial de órdenes del cliente (solo entregadas), con filtros por rango de fechas y búsqueda por placa/modelo.
     */
    public function history(Request $request): Response
    {
        $request->user()?->can('my_orders_history.view') || abort(403);

        $query = WorkOrder::query()
            ->where('client_id', $request->user()->id)
            ->where('status', 'entregado')
            ->with(['vehicle.vehicleModel.brand'])
            ->orderByDesc('entry_date')
            ->orderByDesc('updated_at');

        $dateFrom = $request->string('date_from')->trim()->value() ?: null;
        $dateTo   = $request->string('date_to')->trim()->value() ?: null;
        $search   = $request->string('search')->trim()->value() ?: null;

        if ($dateFrom) {
            $query->whereDate('entry_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('entry_date', '<=', $dateTo);
        }
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereHas('vehicle', function ($v) use ($search) {
                    $v->where('plate', 'like', '%' . $search . '%')
                        ->orWhereHas('vehicleModel', function ($m) use ($search) {
                            $m->where('name', 'like', '%' . $search . '%')
                                ->orWhereHas('brand', function ($b) use ($search) {
                                    $b->where('name', 'like', '%' . $search . '%');
                                });
                        });
                });
            });
        }

        $workOrders = $query->paginate(20)->withQueryString();

        $items = $workOrders->getCollection()->map(fn (WorkOrder $wo) => [
            'id' => $wo->id,
            'entry_date' => $wo->entry_date?->format('Y-m-d'),
            'entry_time' => $wo->entry_time,
            'status' => $wo->status,
            'vehicle_plate' => $wo->vehicle?->plate,
            'vehicle_display' => $wo->vehicle && $wo->vehicle->vehicleModel
                ? trim(($wo->vehicle->vehicleModel->brand?->name ?? '') . ' ' . ($wo->vehicle->vehicleModel->name ?? ''))
                : '—',
            'total_amount' => $wo->total_amount ? (float) $wo->total_amount : null,
            'show_url' => route('dashboard.services.work-orders.show', ['work_order' => $wo->id]),
            'summary_pdf_url' => route('dashboard.services.work-orders.summary.pdf', ['work_order' => $wo->id]),
        ]);

        $workOrders->setCollection(collect($items));

        return Inertia::render('my-orders/history', [
            'workOrders' => $workOrders,
            'filters' => [
                'search' => $search,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'breadcrumbs' => [
                ['title' => 'Panel de control', 'href' => '/dashboard'],
                ['title' => 'Mis órdenes', 'href' => '#'],
                ['title' => 'Mi Historial', 'href' => route('dashboard.my-orders.history')],
            ],
        ]);
    }
}
