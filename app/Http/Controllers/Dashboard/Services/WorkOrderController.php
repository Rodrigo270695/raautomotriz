<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\WorkOrderChecklistResultsRequest;
use App\Http\Requests\Dashboard\Services\WorkOrderRequest;
use App\Models\ServiceChecklist;
use App\Models\Vehicle;
use App\Models\WorkOrder;
use App\Models\WorkOrderChecklistResult;
use App\Models\WorkOrderTicket;
use App\Models\WorkOrderDiagnosis;
use App\Models\WorkOrderPhoto;
use App\Models\Product;
use App\Models\WorkOrderPayment;
use App\Models\WorkOrderService;
use App\Services\NotificationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderController extends Controller
{
    public function show(Request $request, WorkOrder $work_order): Response
    {
        $user = $request->user();
        if ($user && (int) $user->id !== (int) $work_order->created_by && ! $user->hasRole('superadmin')) {
            abort(403, 'Solo el creador de la orden o un superadmin puede ver esta orden.');
        }

        $work_order->load([
            'vehicle:id,plate,vehicle_model_id',
            'vehicle.vehicleModel:id,name',
            'client:id,first_name,last_name',
            'photos',
            'checklistResults.serviceChecklist:id,name,order_number',
            'diagnoses.diagnosedByUser:id,first_name,last_name',
            'services.product.inventoryBrand:id,name',
            'services.servicePackage:id,name',
            'payments',
        ]);

        $workOrdersIndexPath = parse_url(route('dashboard.services.work-orders.index'), PHP_URL_PATH) ?: '/dashboard/services/work-orders';
        $showPath = parse_url(route('dashboard.services.work-orders.show', ['work_order' => $work_order->id]), PHP_URL_PATH);
        $photosIndexPath = parse_url(route('dashboard.services.work-orders.photos.index', ['work_order' => $work_order->id]), PHP_URL_PATH);
        $diagnosesBasePath = parse_url(route('dashboard.services.work-orders.diagnoses.store', ['work_order' => $work_order->id]), PHP_URL_PATH) ?: '';

        $photos = $work_order->photos()->orderBy('type')->orderBy('created_at')->get();
        $typeLabels = WorkOrderPhoto::$types;
        $photoStats = [
            'total' => $photos->count(),
            'by_type' => [
                'entry' => $photos->where('type', 'entry')->count(),
                'diagnosis' => $photos->where('type', 'diagnosis')->count(),
                'process' => $photos->where('type', 'process')->count(),
                'delivery' => $photos->where('type', 'delivery')->count(),
            ],
        ];

        $checklistResults = $work_order->checklistResults->map(fn ($r) => [
            'id' => $r->id,
            'service_checklist_id' => $r->service_checklist_id,
            'checklist_name' => $r->serviceChecklist?->name,
            'checklist_order_number' => $r->serviceChecklist?->order_number,
            'checked' => $r->checked,
            'note' => $r->note,
            'completed_at' => $r->completed_at?->toIso8601String(),
        ]);

        $serviceChecklists = ServiceChecklist::query()
            ->where('status', 'active')
            ->orderBy('order_number')
            ->orderBy('id')
            ->get(['id', 'name', 'order_number']);

        $vehicles = Vehicle::query()->with('vehicleModel:id,name')->select('id', 'plate', 'vehicle_model_id', 'client_id')->orderBy('plate')->limit(500)->get();
        $clients = \App\Models\User::query()
            ->select('id', 'first_name', 'last_name', 'document_number')
            ->whereHas('roles', fn ($q) => $q->where('name', 'cliente'))
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->limit(500)
            ->get();
        $technicians = \App\Models\User::query()
            ->select('id', 'first_name', 'last_name')
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->limit(300)
            ->get();

        $currentUserId = $request->user()?->id;
        $isSuperadmin = $request->user()?->hasRole('superadmin') ?? false;
        $diagnoses = $work_order->diagnoses->map(function (WorkOrderDiagnosis $d) use ($currentUserId, $isSuperadmin) {
            $diagnosedAtLima = $d->diagnosed_at
                ? Carbon::createFromFormat('Y-m-d H:i:s', $d->diagnosed_at->format('Y-m-d H:i:s'), 'America/Lima')
                : null;
            return [
                'id' => $d->id,
                'diagnosis_text' => $d->diagnosis_text,
                'diagnosed_by' => $d->diagnosed_by,
                'diagnosed_at' => $diagnosedAtLima?->toIso8601String(),
                'internal_notes' => $d->internal_notes,
                'diagnosed_by_name' => $d->diagnosedByUser ? trim($d->diagnosedByUser->first_name.' '.$d->diagnosedByUser->last_name) : null,
                'can_edit' => $currentUserId && ((int) $currentUserId === (int) $d->diagnosed_by || $isSuperadmin),
                'can_delete' => $currentUserId && ((int) $currentUserId === (int) $d->diagnosed_by || $isSuperadmin),
            ];
        });

        $services = $work_order->services
            ->sortBy('id')
            ->map(function (WorkOrderService $s) {
                $product = $s->product;
                $brand = $product?->inventoryBrand;

                $productName = $product?->name;
                $brandName = $brand?->name;

                return [
                    'id' => $s->id,
                    'service_package_id' => $s->service_package_id,
                    'service_package_name' => $s->servicePackage?->name,
                    'service_package_item_id' => $s->service_package_item_id,
                    'product_id' => $s->product_id,
                    'type' => $s->type,
                    'product_name' => $productName,
                    'product_brand_name' => $brandName,
                    'description' => $s->description,
                    'quantity' => (float) $s->quantity,
                    'unit_price' => (float) $s->unit_price,
                    'subtotal' => (float) $s->subtotal,
                ];
            })
            ->values();

        $servicesTotal = $services->sum('subtotal');

        $payments = $work_order->payments()->orderByDesc('id')->get()->map(fn (\App\Models\WorkOrderPayment $p) => [
            'id' => $p->id,
            'type' => $p->type,
            'amount' => (float) $p->amount,
            'payment_method' => $p->payment_method,
            'paid_at' => $p->paid_at?->toIso8601String(),
            'reference' => $p->reference,
            'notes' => $p->notes,
        ]);
        $paymentsTotalPaid = $payments->sum('amount');

        $packagesForSelect = \App\Models\ServicePackage::query()
            ->where('status', 'active')
            ->with([
                'serviceType:id,name',
                'items:id,service_package_id,quantity,unit_price',
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function (\App\Models\ServicePackage $p) {
                $total = $p->items->reduce(
                    fn (float $carry, $item) => $carry + ((float) $item->quantity * (float) $item->unit_price),
                    0.0
                );

                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'service_type_name' => $p->serviceType?->name,
                    'total_amount' => round($total, 2),
                ];
            });

        $productsForSelect = \App\Models\Product::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->with('inventoryBrand:id,name')
            ->get(['id', 'name', 'sale_price', 'inventory_brand_id'])
            ->map(function (\App\Models\Product $p) {
                $brandName = $p->inventoryBrand?->name;

                return [
                    'value' => $p->id,
                    'label' => $brandName ? $brandName.' – '.$p->name : $p->name,
                    'sale_price' => (float) $p->sale_price,
                ];
            });

        return Inertia::render('services/work-orders/show', [
            'workOrder' => $work_order,
            'workOrdersIndexPath' => $workOrdersIndexPath,
            'showPath' => $showPath,
            'configPath' => parse_url(route('dashboard.services.work-orders.config', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'photosIndexPath' => $photosIndexPath,
            'diagnoses' => $diagnoses,
            'diagnosesBasePath' => $diagnosesBasePath,
            'technicians' => $technicians->map(fn ($u) => ['id' => $u->id, 'first_name' => $u->first_name, 'last_name' => $u->last_name]),
            'photos' => $photos->map(fn (WorkOrderPhoto $p) => [
                'id' => $p->id,
                'type' => $p->type,
                'path' => $p->path,
                'url' => $p->url,
                'caption' => $p->caption,
                'created_at' => $p->created_at?->toIso8601String(),
            ]),
            'typeLabels' => $typeLabels,
            'photoStats' => $photoStats,
            'serviceChecklists' => $serviceChecklists->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'order_number' => $s->order_number,
            ]),
            'checklistResults' => $checklistResults,
            'vehicles' => $vehicles,
            'clients' => $clients,
            'services' => $services,
            'servicesTotal' => $servicesTotal,
            'servicesBasePath' => parse_url(route('dashboard.services.work-orders.services.store', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'applyPackagePath' => parse_url(route('dashboard.services.work-orders.services.apply-package', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'packagesForSelect' => $packagesForSelect,
            'productsForSelect' => $productsForSelect,
            'showDataTab' => true,
            'checklistResultsPath' => parse_url(route('dashboard.services.work-orders.checklist-results.update', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'lastTicketServiceCount' => $work_order->tickets()->orderByDesc('id')->value('service_count'),
            'payments' => $payments->values(),
            'paymentsTotalPaid' => $paymentsTotalPaid,
            'paymentsBasePath' => parse_url(route('dashboard.services.work-orders.payments.store', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'can' => [
                'update' => $request->user()?->can('work_orders.update') && $currentUserId && ((int) $currentUserId === (int) $work_order->created_by || $isSuperadmin),
                'delete' => $request->user()?->can('work_orders.delete') && $currentUserId && ((int) $currentUserId === (int) $work_order->created_by || $isSuperadmin),
                'photos_create' => $request->user()?->can('work_order_photos.create'),
                'photos_delete' => $request->user()?->can('work_order_photos.delete'),
                'checklist_results_view' => $request->user()?->can('work_order_checklist_results.view'),
                'checklist_results_update' => $request->user()?->can('work_order_checklist_results.update'),
                'diagnoses_view' => $request->user()?->can('work_order_diagnoses.view'),
                'diagnoses_create' => $request->user()?->can('work_order_diagnoses.create'),
                'diagnoses_update' => $request->user()?->can('work_order_diagnoses.update'),
                'diagnoses_delete' => $request->user()?->can('work_order_diagnoses.delete'),
                'services_view' => $request->user()?->can('work_order_services.view'),
                'payments_view' => $request->user()?->can('work_order_payments.view'),
                'payments_create' => $request->user()?->can('work_order_payments.create'),
                'payments_delete' => $request->user()?->can('work_order_payments.delete'),
                'payments_print_ticket' => $request->user()?->can('work_order_payments.print_ticket'),
                'tickets_print' => $request->user()?->can('work_order_tickets.print'),
            ],
        ]);
    }

    public function config(Request $request, WorkOrder $work_order): Response
    {
        $user = $request->user();
        if ($user && (int) $user->id !== (int) $work_order->created_by && ! $user->hasRole('superadmin')) {
            abort(403, 'Solo el creador de la orden o un superadmin puede acceder a la configuración.');
        }

        $work_order->load([
            'vehicle:id,plate,vehicle_model_id',
            'vehicle.vehicleModel:id,name',
            'client:id,first_name,last_name',
            'photos',
            'checklistResults.serviceChecklist:id,name,order_number',
            'diagnoses.diagnosedByUser:id,first_name,last_name',
            'services.product.inventoryBrand:id,name',
            'services.servicePackage:id,name',
            'payments',
        ]);

        $workOrdersIndexPath = parse_url(route('dashboard.services.work-orders.index'), PHP_URL_PATH) ?: '/dashboard/services/work-orders';
        $configPath = parse_url(route('dashboard.services.work-orders.config', ['work_order' => $work_order->id]), PHP_URL_PATH);
        $photosIndexPath = parse_url(route('dashboard.services.work-orders.photos.index', ['work_order' => $work_order->id]), PHP_URL_PATH);
        $diagnosesBasePath = parse_url(route('dashboard.services.work-orders.diagnoses.store', ['work_order' => $work_order->id]), PHP_URL_PATH) ?: '';

        $photos = $work_order->photos()->orderBy('type')->orderBy('created_at')->get();
        $typeLabels = WorkOrderPhoto::$types;
        $photoStats = [
            'total' => $photos->count(),
            'by_type' => [
                'entry' => $photos->where('type', 'entry')->count(),
                'diagnosis' => $photos->where('type', 'diagnosis')->count(),
                'process' => $photos->where('type', 'process')->count(),
                'delivery' => $photos->where('type', 'delivery')->count(),
            ],
        ];

        $currentUserIdConfig = $request->user()?->id;
        $isSuperadminConfig = $request->user()?->hasRole('superadmin') ?? false;
        $diagnosesConfig = $work_order->diagnoses->map(function (WorkOrderDiagnosis $d) use ($currentUserIdConfig, $isSuperadminConfig) {
            $diagnosedAtLima = $d->diagnosed_at
                ? Carbon::createFromFormat('Y-m-d H:i:s', $d->diagnosed_at->format('Y-m-d H:i:s'), 'America/Lima')
                : null;
            return [
                'id' => $d->id,
                'diagnosis_text' => $d->diagnosis_text,
                'diagnosed_by' => $d->diagnosed_by,
                'diagnosed_at' => $diagnosedAtLima?->toIso8601String(),
                'internal_notes' => $d->internal_notes,
                'diagnosed_by_name' => $d->diagnosedByUser ? trim($d->diagnosedByUser->first_name.' '.$d->diagnosedByUser->last_name) : null,
                'can_edit' => $currentUserIdConfig && ((int) $currentUserIdConfig === (int) $d->diagnosed_by || $isSuperadminConfig),
                'can_delete' => $currentUserIdConfig && ((int) $currentUserIdConfig === (int) $d->diagnosed_by || $isSuperadminConfig),
            ];
        });
        $techniciansConfig = \App\Models\User::query()
            ->select('id', 'first_name', 'last_name')
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->limit(300)
            ->get()
            ->map(fn ($u) => ['id' => $u->id, 'first_name' => $u->first_name, 'last_name' => $u->last_name]);

        $checklistResults = $work_order->checklistResults->map(fn ($r) => [
            'id' => $r->id,
            'service_checklist_id' => $r->service_checklist_id,
            'checklist_name' => $r->serviceChecklist?->name,
            'checklist_order_number' => $r->serviceChecklist?->order_number,
            'checked' => $r->checked,
            'note' => $r->note,
            'completed_at' => $r->completed_at?->toIso8601String(),
        ]);

        $serviceChecklistsConfig = ServiceChecklist::query()
            ->where('status', 'active')
            ->orderBy('order_number')
            ->orderBy('id')
            ->get(['id', 'name', 'order_number']);

        $vehicles = Vehicle::query()->with('vehicleModel:id,name')->select('id', 'plate', 'vehicle_model_id', 'client_id')->orderBy('plate')->limit(500)->get();
        $clients = \App\Models\User::query()
            ->select('id', 'first_name', 'last_name', 'document_number')
            ->whereHas('roles', fn ($q) => $q->where('name', 'cliente'))
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->limit(500)
            ->get();

        $services = $work_order->services
            ->sortBy('id')
            ->map(function (WorkOrderService $s) {
                $product = $s->product;
                $brand = $product?->inventoryBrand;

                $productName = $product?->name;
                $brandName = $brand?->name;

                return [
                    'id' => $s->id,
                    'service_package_id' => $s->service_package_id,
                    'service_package_name' => $s->servicePackage?->name,
                    'service_package_item_id' => $s->service_package_item_id,
                    'product_id' => $s->product_id,
                    'type' => $s->type,
                    'product_name' => $productName,
                    'product_brand_name' => $brandName,
                    'description' => $s->description,
                    'quantity' => (float) $s->quantity,
                    'unit_price' => (float) $s->unit_price,
                    'subtotal' => (float) $s->subtotal,
                ];
            })
            ->values();

        $servicesTotal = $services->sum('subtotal');

        $payments = $work_order->payments()->orderByDesc('id')->get()->map(fn (\App\Models\WorkOrderPayment $p) => [
            'id' => $p->id,
            'type' => $p->type,
            'amount' => (float) $p->amount,
            'payment_method' => $p->payment_method,
            'paid_at' => $p->paid_at?->toIso8601String(),
            'reference' => $p->reference,
            'notes' => $p->notes,
        ]);
        $paymentsTotalPaid = $payments->sum('amount');

        $packagesForSelect = \App\Models\ServicePackage::query()
            ->where('status', 'active')
            ->with([
                'serviceType:id,name',
                'items:id,service_package_id,quantity,unit_price',
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function (\App\Models\ServicePackage $p) {
                $total = $p->items->reduce(
                    fn (float $carry, $item) => $carry + ((float) $item->quantity * (float) $item->unit_price),
                    0.0
                );

                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'service_type_name' => $p->serviceType?->name,
                    'total_amount' => round($total, 2),
                ];
            });

        $productsForSelect = \App\Models\Product::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->with('inventoryBrand:id,name')
            ->get(['id', 'name', 'sale_price', 'inventory_brand_id'])
            ->map(function (\App\Models\Product $p) {
                $brandName = $p->inventoryBrand?->name;

                return [
                    'value' => $p->id,
                    'label' => $brandName ? $brandName.' – '.$p->name : $p->name,
                    'sale_price' => (float) $p->sale_price,
                ];
            });

        return Inertia::render('services/work-orders/show', [
            'workOrder' => $work_order,
            'workOrdersIndexPath' => $workOrdersIndexPath,
            'showPath' => parse_url(route('dashboard.services.work-orders.show', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'configPath' => $configPath,
            'photosIndexPath' => $photosIndexPath,
            'diagnoses' => $diagnosesConfig,
            'diagnosesBasePath' => $diagnosesBasePath,
            'technicians' => $techniciansConfig,
            'photos' => $photos->map(fn (WorkOrderPhoto $p) => [
                'id' => $p->id,
                'type' => $p->type,
                'path' => $p->path,
                'url' => $p->url,
                'caption' => $p->caption,
                'created_at' => $p->created_at?->toIso8601String(),
            ]),
            'typeLabels' => $typeLabels,
            'photoStats' => $photoStats,
            'serviceChecklists' => $serviceChecklistsConfig->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'order_number' => $s->order_number,
            ]),
            'checklistResults' => $checklistResults,
            'vehicles' => $vehicles,
            'clients' => $clients,
            'services' => $services,
            'servicesTotal' => $servicesTotal,
            'servicesBasePath' => parse_url(route('dashboard.services.work-orders.services.store', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'applyPackagePath' => parse_url(route('dashboard.services.work-orders.services.apply-package', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'packagesForSelect' => $packagesForSelect,
            'productsForSelect' => $productsForSelect,
            'showDataTab' => false,
            'checklistResultsPath' => parse_url(route('dashboard.services.work-orders.checklist-results.update', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'confirmRepairPath' => parse_url(route('dashboard.services.work-orders.confirm-repair', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'ticket_print_url' => session('ticket_print_url'),
            'lastTicketPrintUrl' => (function () use ($work_order) {
                $last = $work_order->tickets()->orderByDesc('id')->first();
                return $last ? route('dashboard.services.work-orders.tickets.print', ['work_order' => $work_order->id, 'ticket' => $last->id]) : null;
            })(),
            'lastTicketServiceCount' => $work_order->tickets()->orderByDesc('id')->value('service_count'),
            'payments' => $payments->values(),
            'paymentsTotalPaid' => $paymentsTotalPaid,
            'paymentsBasePath' => parse_url(route('dashboard.services.work-orders.payments.store', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'can' => [
                'update' => $request->user()?->can('work_orders.update') && $currentUserIdConfig && ((int) $currentUserIdConfig === (int) $work_order->created_by || $isSuperadminConfig),
                'delete' => $request->user()?->can('work_orders.delete') && $currentUserIdConfig && ((int) $currentUserIdConfig === (int) $work_order->created_by || $isSuperadminConfig),
                'photos_create' => $request->user()?->can('work_order_photos.create'),
                'photos_delete' => $request->user()?->can('work_order_photos.delete'),
                'checklist_results_view' => $request->user()?->can('work_order_checklist_results.view'),
                'checklist_results_update' => $request->user()?->can('work_order_checklist_results.update'),
                'diagnoses_view' => $request->user()?->can('work_order_diagnoses.view'),
                'diagnoses_create' => $request->user()?->can('work_order_diagnoses.create'),
                'diagnoses_update' => $request->user()?->can('work_order_diagnoses.update'),
                'diagnoses_delete' => $request->user()?->can('work_order_diagnoses.delete'),
                'services_view' => $request->user()?->can('work_order_services.view'),
                'payments_view' => $request->user()?->can('work_order_payments.view'),
                'payments_create' => $request->user()?->can('work_order_payments.create'),
                'payments_delete' => $request->user()?->can('work_order_payments.delete'),
                'payments_print_ticket' => $request->user()?->can('work_order_payments.print_ticket'),
                'tickets_print' => $request->user()?->can('work_order_tickets.print'),
            ],
        ]);
    }

    /**
     * Guardar y generar ticket. Si la orden no está en reparación, pasa estado a en_reparacion (solo una vez).
     * Redirige a config con flash ticket_print_url para preguntar si imprime.
     */
    public function confirmRepair(Request $request, WorkOrder $work_order): RedirectResponse
    {
        if (! $request->user()?->can('work_orders.update')) {
            abort(403);
        }

        $wasNotInRepair = ! in_array($work_order->status, ['en_reparacion', 'listo_para_entregar', 'entregado', 'cancelado'], true);
        if ($wasNotInRepair) {
            $work_order->update(['status' => 'en_reparacion']);
        }

        $previousTicketServiceCount = (int) $work_order->tickets()->orderByDesc('id')->value('service_count');
        $ticket = $work_order->tickets()->create([
            'token' => WorkOrderTicket::generateToken(),
            'service_count' => $work_order->services()->count(),
        ]);

        $servicesOrdered = $work_order->services()->orderBy('id')->get();
        $newLines = $servicesOrdered->slice($previousTicketServiceCount);

        DB::transaction(function () use ($newLines) {
            foreach ($newLines as $line) {
                if ($line->product_id === null) {
                    continue;
                }
                if ($line->stock_deducted_at !== null) {
                    continue;
                }
                $qty = (float) $line->quantity;
                if ($qty <= 0) {
                    continue;
                }
                $product = Product::find($line->product_id);
                if ($product !== null) {
                    $newStock = max(0, (int) $product->stock - (int) round($qty, 0));
                    $product->update(['stock' => $newStock]);
                }
                $line->update(['stock_deducted_at' => now()]);
            }
        });

        $ticketPrintUrl = route('dashboard.services.work-orders.tickets.print', [
            'work_order' => $work_order->id,
            'ticket' => $ticket->id,
        ]);

        $message = $wasNotInRepair ? 'Orden en reparación. Ticket generado.' : 'Ticket generado.';

        return redirect()->route('dashboard.services.work-orders.config', ['work_order' => $work_order->id])
            ->with('flash', ['type' => 'success', 'message' => $message])
            ->with('ticket_id', $ticket->id)
            ->with('ticket_print_url', $ticketPrintUrl);
    }

    /**
     * Vista térmica del ticket para impresora térmica (80mm).
     */
    public function printTicket(Request $request, WorkOrder $work_order, WorkOrderTicket $ticket): View
    {
        if ($ticket->work_order_id !== (int) $work_order->id) {
            abort(404);
        }

        $work_order->load([
            'vehicle.vehicleModel:id,name',
            'client:id,first_name,last_name',
            'services.product.inventoryBrand:id,name',
            'services.servicePackage:id,name',
        ]);

        $services = $work_order->services->map(function (WorkOrderService $s) {
            $product = $s->product;
            $brand = $product?->inventoryBrand;
            $productName = $product?->name;
            $brandName = $brand?->name;
            $label = trim($s->description ?? '');
            if ($productName !== null && $productName !== '') {
                $label = $brandName ? trim($brandName.' – '.$productName) : trim($productName);
            }
            if ($label === '') {
                $label = 'Ítem';
            }

            return [
                'description' => $label,
                'quantity' => (float) $s->quantity,
                'unit_price' => (float) $s->unit_price,
                'subtotal' => (float) $s->subtotal,
            ];
        });

        $servicesTotal = (float) $work_order->services->sum('subtotal');
        // IGV incluido (18%): base = total/1.18, IGV = total - base
        $baseImponible = round($servicesTotal / 1.18, 2);
        $igv = round($servicesTotal - $baseImponible, 2);

        $vehicleLabel = $work_order->vehicle
            ? trim($work_order->vehicle->plate.' '.($work_order->vehicle->vehicleModel?->name ?? ''))
            : '—';
        $clientLabel = $work_order->client
            ? trim($work_order->client->first_name.' '.$work_order->client->last_name)
            : '—';

        return view('thermal.work-order-ticket', [
            'work_order' => $work_order,
            'ticket' => $ticket,
            'services' => $services,
            'servicesTotal' => $servicesTotal,
            'baseImponible' => $baseImponible,
            'igv' => $igv,
            'vehicleLabel' => $vehicleLabel,
            'clientLabel' => $clientLabel,
        ]);
    }

    public function index(Request $request): Response
    {
        $query = WorkOrder::query()
            ->with(['vehicle:id,plate,vehicle_model_id', 'vehicle.vehicleModel:id,name', 'client:id,first_name,last_name'])
            ->withSum('payments', 'amount');

        $search = $request->input('search');
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereHas('vehicle', fn ($v) => $v->where('plate', 'like', '%'.$search.'%'))
                    ->orWhereHas('client', fn ($c) => $c->where('first_name', 'like', '%'.$search.'%')->orWhere('last_name', 'like', '%'.$search.'%'));
            });
        }

        $filterStatus = $request->input('filter_status', 'all');
        if ($filterStatus !== 'all') {
            $query->where('status', $filterStatus);
        }

        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        if ($dateFrom !== null && $dateFrom !== '') {
            $query->whereDate('entry_date', '>=', $dateFrom);
        }
        if ($dateTo !== null && $dateTo !== '') {
            $query->whereDate('entry_date', '<=', $dateTo);
        }

        $sortBy = $request->input('sort_by', 'entry_date');
        $sortDir = $request->input('sort_dir', 'desc');
        if (in_array($sortBy, ['id', 'entry_date', 'entry_time', 'status', 'total_amount', 'created_at'], true) && in_array($sortDir, ['asc', 'desc'], true)) {
            if ($sortBy === 'entry_date') {
                $query->orderBy('entry_date', $sortDir)->orderBy('entry_time', $sortDir)->orderBy('id', $sortDir);
            } else {
                $query->orderBy($sortBy, $sortDir);
            }
        } else {
            $query->orderBy('entry_date', 'desc')->orderBy('entry_time', 'desc')->orderBy('id', 'desc');
        }

        $workOrders = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $indexUserId = $request->user()?->id;
        $indexSuperadmin = $request->user()?->hasRole('superadmin') ?? false;
        $canUpdate = $request->user()?->can('work_orders.update');
        $canDelete = $request->user()?->can('work_orders.delete');
        $workOrders->getCollection()->transform(function (WorkOrder $wo) use ($indexUserId, $indexSuperadmin, $canUpdate, $canDelete) {
            $isAuthorOrSuperadmin = $indexUserId && ((int) $indexUserId === (int) $wo->created_by || $indexSuperadmin);
            $wo->setAttribute('can_edit', $canUpdate && $isAuthorOrSuperadmin);
            $wo->setAttribute('can_delete', $canDelete && $isAuthorOrSuperadmin);
            $wo->setAttribute('total_paid', (float) ($wo->payments_sum_amount ?? 0));

            return $wo;
        });

        $workOrdersIndexPath = parse_url(route('dashboard.services.work-orders.index'), PHP_URL_PATH) ?: '/dashboard/services/work-orders';

        $vehicles = Vehicle::query()->with('vehicleModel:id,name')->select('id', 'plate', 'vehicle_model_id', 'client_id')->orderBy('plate')->limit(500)->get();
        $clients = \App\Models\User::query()
            ->select('id', 'first_name', 'last_name', 'document_number')
            ->whereHas('roles', fn ($q) => $q->where('name', 'cliente'))
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->limit(500)
            ->get();

        return Inertia::render('services/work-orders/index', [
            'workOrders' => $workOrders,
            'filters' => [
                'search' => $search,
                'per_page' => $request->input('per_page', 10),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'filter_status' => $filterStatus,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'workOrdersIndexPath' => $workOrdersIndexPath,
            'stats' => [
                'total_work_orders' => WorkOrder::count(),
                'total_ingreso' => WorkOrder::where('status', 'ingreso')->count(),
            ],
            'vehicles' => $vehicles,
            'clients' => $clients,
            'can' => [
                'create' => $request->user()?->can('work_orders.create'),
                'update' => $request->user()?->can('work_orders.update'),
                'delete' => $request->user()?->can('work_orders.delete'),
                'view_photos' => $request->user()?->can('work_order_photos.view'),
            ],
        ]);
    }

    public function store(WorkOrderRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()?->id;
        $data['total_amount'] = 0; // Se actualiza automáticamente al agregar servicios/productos
        $workOrder = WorkOrder::create($data);

        $advance = (float) ($data['advance_payment_amount'] ?? 0);
        if ($advance > 0) {
            $workOrder->payments()->create([
                'type' => 'advance',
                'is_initial_advance' => true,
                'amount' => $advance,
                'payment_method' => null,
                'paid_at' => now(),
                'reference' => 'PAG-'.$workOrder->id.'-0001',
                'notes' => null,
            ]);
        }

        $this->sendWelcomeNotification($workOrder);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Orden de trabajo creada correctamente.']);
    }

    public function update(WorkOrderRequest $request, WorkOrder $workOrder): RedirectResponse
    {
        $user = $request->user();
        if (! $user?->can('work_orders.update')) {
            abort(403);
        }
        if ((int) $user->id !== (int) $workOrder->created_by && ! $user->hasRole('superadmin')) {
            abort(403);
        }

        $data = $request->validated();
        $workOrder->update($data);
        $workOrder->recalcTotalFromServices(); // Mantener total coherente con la suma de servicios

        $advance = (float) ($data['advance_payment_amount'] ?? 0);
        $initialPayment = $workOrder->payments()->where('is_initial_advance', true)->first();
        if ($initialPayment !== null) {
            if ($advance <= 0) {
                $initialPayment->delete();
            } else {
                $initialPayment->update(['amount' => $advance]);
            }
        } elseif ($advance > 0) {
            $nextNum = $workOrder->payments()->count() + 1;
            $reference = 'PAG-'.$workOrder->id.'-'.str_pad((string) $nextNum, 4, '0', STR_PAD_LEFT);
            $workOrder->payments()->create([
                'type' => 'advance',
                'is_initial_advance' => true,
                'amount' => $advance,
                'payment_method' => null,
                'paid_at' => now(),
                'reference' => $reference,
                'notes' => null,
            ]);
        }

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Orden de trabajo actualizada correctamente.']);
    }

    public function destroy(Request $request, WorkOrder $workOrder): RedirectResponse
    {
        $user = $request->user();
        if (! $user?->can('work_orders.delete')) {
            abort(403);
        }
        if ((int) $user->id !== (int) $workOrder->created_by && ! $user->hasRole('superadmin')) {
            abort(403);
        }

        $workOrder->delete();

        return redirect()->route('dashboard.services.work-orders.index')
            ->with('flash', ['type' => 'success', 'message' => 'Orden de trabajo eliminada correctamente.']);
    }

    public function updateChecklistResults(WorkOrderChecklistResultsRequest $request, WorkOrder $work_order): RedirectResponse
    {
        $userId = $request->user()?->id;
        $now = now();

        // Solo la primera vez que se guarda la lista de chequeo se cambia el estado a "En checklist".
        $isFirstSave = ! $work_order->checklistResults()->exists();

        foreach ($request->validated('results') as $item) {
            WorkOrderChecklistResult::query()->updateOrCreate(
                [
                    'work_order_id' => $work_order->id,
                    'service_checklist_id' => $item['service_checklist_id'],
                ],
                [
                    'checked' => $item['checked'],
                    'note' => $item['note'] ?: null,
                    'completed_at' => $now,
                    'completed_by' => $userId,
                ]
            );
        }

        if ($isFirstSave) {
            $work_order->update(['status' => 'en_checklist']);
        }

        // Si es la primera vez: enviar “chequeo realizado” con fotos.
        // Si es una actualización posterior: solo enviar PDF con mensaje de actualización.
        $this->sendChecklistCompletedNotification($work_order, ! $isFirstSave);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Lista de chequeo actualizada correctamente.']);
    }

    /**
     * Envía bienvenida por email y WhatsApp al cliente cuando se crea la orden.
     */
    private function sendWelcomeNotification(WorkOrder $workOrder): void
    {
        $workOrder->load(['vehicle.vehicleModel.brand', 'client']);
        $client = $workOrder->client;
        $vehicle = $workOrder->vehicle;

        if (! $client) {
            return;
        }

        $nombre = trim($client->first_name ?? '');
        $marca = $vehicle?->vehicleModel?->brand?->name ?? '';
        $modelo = $vehicle?->vehicleModel?->name ?? '';
        $placa = $vehicle?->plate ?? '';
        $vehiculoTexto = trim("{$marca} {$modelo}");
        if ($vehiculoTexto !== '' && $placa !== '') {
            $vehiculoTexto .= " (placa {$placa})";
        } elseif ($placa !== '') {
            $vehiculoTexto = "placa {$placa}";
        }
        if ($vehiculoTexto === '') {
            $vehiculoTexto = 'su vehículo';
        }

        $kilometraje = $workOrder->entry_mileage !== null && $workOrder->entry_mileage !== ''
            ? ' con kilometraje de ingreso: ' . number_format((float) $workOrder->entry_mileage, 0, '', ',') . ' km.'
            : '.';

        $saludo = $nombre !== '' ? "Estimado/a {$nombre}," : 'Estimado/a cliente,';
        $mensaje = "Bienvenido a RA Automotriz S.A.C.\n\n"
            . "{$saludo}\n\n"
            . "Le informamos que {$vehiculoTexto} ha ingresado a nuestro taller{$kilometraje}\n\n"
            . "Nuestro equipo realizará el chequeo y diagnóstico correspondiente; le mantendremos informado/a en cada etapa.\n\n"
            . "Gracias por confiar en nosotros. ¡Estamos a su disposición!";

        $asunto = 'Bienvenida – Su vehículo ha ingresado a RA Automotriz';

        $notificationService = app(NotificationService::class);
        $notificationService->sendEmail($client, $asunto, $mensaje, $workOrder);
        $notificationService->sendWhatsApp($client, $mensaje, $workOrder);
    }

    /**
     * Envía al cliente notificación de chequeo realizado/actualizado.
     * - Primera vez: PDF + fotos de ingreso (email y WhatsApp).
     * - Actualización: solo PDF actualizado (email y WhatsApp).
     */
    private function sendChecklistCompletedNotification(WorkOrder $work_order, bool $isUpdate = false): void
    {
        $work_order->load(['vehicle.vehicleModel.brand', 'client', 'checklistResults.serviceChecklist', 'photos']);
        $client = $work_order->client;
        if (! $client) {
            return;
        }

        $clientName = trim($client->first_name . ' ' . $client->last_name) ?: 'Cliente';
        $vehicle = $work_order->vehicle;
        $vehicleLabel = $vehicle
            ? trim(($vehicle->vehicleModel?->brand?->name ?? '') . ' ' . ($vehicle->vehicleModel?->name ?? '') . ' ' . ($vehicle->plate ?? ''))
            : '—';

        $checklistRows = $work_order->checklistResults->map(function (WorkOrderChecklistResult $r) {
            return [
                'name' => $r->serviceChecklist?->name ?? '—',
                'checked' => (bool) $r->checked,
                'note' => $r->note ?? '',
            ];
        })->all();

        $pdfPath = null;
        $generatedAt = now('America/Lima');
        try {
            $pdfRelativePath = 'notifications/checklist-orden-' . $work_order->id . '.pdf';
            $logoDataUri = null;
            $logoPath = public_path('logorasf.png');
            if (is_file($logoPath)) {
                $logoDataUri = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
            }
            Pdf::loadView('pdf.checklist-report', [
                'workOrder' => $work_order,
                'clientName' => $clientName,
                'vehicleLabel' => $vehicleLabel,
                'checklistRows' => $checklistRows,
                'generatedAt' => $generatedAt,
                'isUpdate' => $isUpdate,
                'logoDataUri' => $logoDataUri,
            ])->save($pdfRelativePath, 'public');
            $pdfPath = $pdfRelativePath;
        } catch (\Throwable $e) {
            report($e);
        }

        $nombre = trim($client->first_name ?? '');
        $saludo = $nombre !== '' ? "Estimado/a {$nombre}," : 'Estimado/a cliente,';
        if (! $isUpdate) {
            $mensajeCuerpo = "Le informamos que hemos realizado el chequeo de ingreso de su vehículo en RA Automotriz S.A.C.\n\n"
                . "{$saludo}\n\n"
                . "Nuestro equipo completó la lista de verificación y hemos registrado el estado de cada ítem. "
                . "En este correo encontrará el detalle en PDF y las fotos de ingreso de su unidad.\n\n"
                . "Si tiene alguna consulta, no dude en contactarnos. ¡Gracias por confiar en nosotros!";

            $mensajeWhatsApp = "RA Automotriz S.A.C.\n\n"
                . "Le informamos que hemos realizado el chequeo de ingreso de su vehículo y completado la lista de chequeo.\n\n"
                . "Le hemos enviado el detalle completo en un documento PDF junto con las fotos de ingreso de su unidad.\n\n"
                . "\n\nGracias por confiar en nosotros.";

            $asunto = 'Chequeo realizado – Su vehículo fue revisado | RA Automotriz';
        } else {
            $mensajeCuerpo = "Le informamos que hemos actualizado la lista de chequeo de ingreso de su vehículo en RA Automotriz S.A.C.\n\n"
                . "{$saludo}\n\n"
                . "Adjuntamos el documento PDF con la versión actualizada del chequeo, donde se reflejan los cambios realizados.\n\n"
                . "Si tiene alguna consulta, no dude en contactarnos. ¡Gracias por confiar en nosotros!";

            $mensajeWhatsApp = "RA Automotriz S.A.C.\n\n"
                . "Hemos actualizado la lista de chequeo de ingreso de su vehículo.\n\n"
                . "Le enviamos el documento PDF con el detalle actualizado del chequeo.\n\n"
                . "Gracias por confiar en nosotros.";

            $asunto = 'Actualización de lista de chequeo – Orden #' . $work_order->id;
        }

        $notificationService = app(NotificationService::class);

        $attachments = $isUpdate
            ? array_filter([$pdfPath])
            : array_filter([$pdfPath, ...$work_order->photos->where('type', WorkOrderPhoto::TYPE_ENTRY)->pluck('path')->all()]);
        $notificationService->sendEmail($client, $asunto, $mensajeCuerpo, $work_order, $attachments);
        $notificationService->sendWhatsApp($client, $mensajeWhatsApp, $work_order, $attachments);

        // Enviar PDF por WhatsApp en Base64 (funciona en local y producción)
        if ($pdfPath) {
            $pdfFullPath = Storage::disk('public')->path($pdfPath);
            $notificationService->sendWhatsAppDocument(
                $client,
                $pdfFullPath,
                'Checklist-orden-' . $work_order->id . '.pdf',
                $isUpdate
                    ? 'Checklist actualizado – Orden #' . $work_order->id
                    : 'Checklist de ingreso – Orden #' . $work_order->id
            );
        }
        // Solo en el primer chequeo enviamos también las fotos de ingreso por WhatsApp.
        if (! $isUpdate) {
            $entryPhotos = $work_order->photos->where('type', WorkOrderPhoto::TYPE_ENTRY);
            foreach ($entryPhotos as $photo) {
                if ($photo->path && Storage::disk('public')->exists($photo->path)) {
                    $imageFullPath = Storage::disk('public')->path($photo->path);
                    $notificationService->sendWhatsAppImage($client, $imageFullPath, 'Foto de ingreso – Orden #' . $work_order->id);
                }
            }
        }
    }
}
