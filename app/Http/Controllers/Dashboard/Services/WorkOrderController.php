<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Exports\WorkOrdersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\WorkOrderChecklistResultsRequest;
use App\Http\Requests\Dashboard\Services\WorkOrderRequest;
use App\Jobs\SendChecklistNotificationJob;
use App\Jobs\SendWelcomeNotificationJob;
use App\Models\ServiceChecklist;
use App\Models\Vehicle;
use App\Models\WorkOrder;
use App\Models\WorkOrderChecklistResult;
use App\Models\WorkOrderDiagnosis;
use App\Models\WorkOrderPhoto;
use App\Models\WorkOrderService;
use App\Models\WorkOrderTicket;
use App\Models\Product;
use App\Models\WorkOrderPayment;
use App\Repositories\WorkOrderRepository;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class WorkOrderController extends Controller
{
    public function __construct(private readonly WorkOrderRepository $repository) {}

    public function show(Request $request, WorkOrder $work_order): Response
    {
        $user = $request->user();
        if ($user && (int) $user->id !== (int) $work_order->created_by && ! $user->hasRole('superadmin')) {
            abort(403, 'Solo el creador de la orden o un superadmin puede ver esta orden.');
        }

        $this->loadWorkOrderRelations($work_order);

        return Inertia::render('services/work-orders/show', array_merge(
            $this->buildWorkOrderViewData($work_order, $request),
            [
                'showPath' => parse_url(route('dashboard.services.work-orders.show', ['work_order' => $work_order->id]), PHP_URL_PATH),
                'configPath' => parse_url(route('dashboard.services.work-orders.config', ['work_order' => $work_order->id]), PHP_URL_PATH),
                'showDataTab' => true,
                'lastTicketServiceCount' => $work_order->tickets()->orderByDesc('id')->value('service_count'),
            ]
        ));
    }

    public function config(Request $request, WorkOrder $work_order): Response
    {
        $user = $request->user();
        if ($user && (int) $user->id !== (int) $work_order->created_by && ! $user->hasRole('superadmin')) {
            abort(403, 'Solo el creador de la orden o un superadmin puede acceder a la configuración.');
        }

        $this->loadWorkOrderRelations($work_order);

        $lastTicket = $work_order->tickets()->orderByDesc('id')->first();

        return Inertia::render('services/work-orders/show', array_merge(
            $this->buildWorkOrderViewData($work_order, $request),
            [
                'showPath' => parse_url(route('dashboard.services.work-orders.show', ['work_order' => $work_order->id]), PHP_URL_PATH),
                'configPath' => parse_url(route('dashboard.services.work-orders.config', ['work_order' => $work_order->id]), PHP_URL_PATH),
                'showDataTab' => false,
                'confirmRepairPath' => parse_url(route('dashboard.services.work-orders.confirm-repair', ['work_order' => $work_order->id]), PHP_URL_PATH),
                'ticket_print_url' => session('ticket_print_url'),
                'lastTicketPrintUrl' => $lastTicket
                    ? route('dashboard.services.work-orders.tickets.print', ['work_order' => $work_order->id, 'ticket' => $lastTicket->id])
                    : null,
                'lastTicketServiceCount' => $lastTicket?->service_count,
            ]
        ));
    }

    /**
     * Carga las relaciones necesarias para las vistas show/config.
     */
    private function loadWorkOrderRelations(WorkOrder $work_order): void
    {
        $work_order->load([
            'vehicle:id,plate,vehicle_model_id',
            'vehicle.vehicleModel:id,name',
            'client:id,first_name,last_name,document_number',
            'photos',
            'checklistResults.serviceChecklist:id,name,order_number',
            'diagnoses.diagnosedByUser:id,first_name,last_name',
            'services.product.inventoryBrand:id,name',
            'services.servicePackage:id,name',
            'payments',
        ]);
    }

    /**
     * Construye los datos compartidos entre show() y config().
     *
     * @return array<string, mixed>
     */
    private function buildWorkOrderViewData(WorkOrder $work_order, Request $request): array
    {
        $currentUserId = $request->user()?->id;
        $isSuperadmin = $request->user()?->hasRole('superadmin') ?? false;

        $photos = $work_order->photos()->orderBy('type')->orderBy('created_at')->get();

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

        $localTz = config('app.local_timezone', 'America/Lima');
        $diagnoses = $work_order->diagnoses->map(function (WorkOrderDiagnosis $d) use ($currentUserId, $isSuperadmin, $localTz) {
            $diagnosedAtLima = $d->diagnosed_at
                ? Carbon::createFromFormat('Y-m-d H:i:s', $d->diagnosed_at->format('Y-m-d H:i:s'), $localTz)
                : null;

            return [
                'id' => $d->id,
                'diagnosis_text' => $d->diagnosis_text,
                'diagnosed_by' => $d->diagnosed_by,
                'diagnosed_at' => $diagnosedAtLima?->toIso8601String(),
                'internal_notes' => $d->internal_notes,
                'diagnosed_by_name' => $d->diagnosedByUser
                    ? trim($d->diagnosedByUser->first_name.' '.$d->diagnosedByUser->last_name)
                    : null,
                'can_edit' => $currentUserId && ((int) $currentUserId === (int) $d->diagnosed_by || $isSuperadmin),
                'can_delete' => $currentUserId && ((int) $currentUserId === (int) $d->diagnosed_by || $isSuperadmin),
            ];
        });

        $services = $work_order->services
            ->sortBy('id')
            ->map(function (WorkOrderService $s) {
                $product = $s->product;
                $brand = $product?->inventoryBrand;

                return [
                    'id' => $s->id,
                    'service_package_id' => $s->service_package_id,
                    'service_package_name' => $s->servicePackage?->name,
                    'service_package_item_id' => $s->service_package_item_id,
                    'product_id' => $s->product_id,
                    'type' => $s->type,
                    'product_name' => $product?->name,
                    'product_brand_name' => $brand?->name,
                    'description' => $s->description,
                    'quantity' => (float) $s->quantity,
                    'unit_price' => (float) $s->unit_price,
                    'subtotal' => (float) $s->subtotal,
                ];
            })
            ->values();

        $payments = $work_order->payments->sortByDesc('id')->map(fn (WorkOrderPayment $p) => [
            'id' => $p->id,
            'type' => $p->type,
            'amount' => (float) $p->amount,
            'payment_method' => $p->payment_method,
            'paid_at' => $p->paid_at?->toIso8601String(),
            'reference' => $p->reference,
            'notes' => $p->notes,
        ]);

        $technicians = \App\Models\User::query()
            ->select('id', 'first_name', 'last_name')
            ->where('status', 'active')
            ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'cliente'))
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get()
            ->map(fn ($u) => ['id' => $u->id, 'first_name' => $u->first_name, 'last_name' => $u->last_name]);

        $serviceChecklists = Cache::remember('service_checklists_active', 300, fn () => ServiceChecklist::query()
            ->where('status', 'active')
            ->orderBy('order_number')
            ->orderBy('id')
            ->get(['id', 'name', 'order_number']));

        $packagesForSelect = Cache::remember('packages_for_select', 300, fn () => \App\Models\ServicePackage::query()
            ->where('status', 'active')
            ->with(['serviceType:id,name', 'items:id,service_package_id,quantity,unit_price'])
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
            }));

        $productsForSelect = Cache::remember('products_for_select', 120, fn () => \App\Models\Product::query()
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
            }));

        $initialClient = $work_order->client
            ? [
                'id' => $work_order->client->id,
                'first_name' => $work_order->client->first_name,
                'last_name' => $work_order->client->last_name,
                'document_number' => $work_order->client->document_number ?? null,
            ]
            : null;

        $initialVehicle = $work_order->vehicle
            ? [
                'id' => $work_order->vehicle->id,
                'plate' => $work_order->vehicle->plate,
                'vehicle_model_id' => $work_order->vehicle->vehicle_model_id,
                'client_id' => $work_order->client_id,
                'vehicle_model' => $work_order->vehicle->vehicleModel
                    ? ['id' => $work_order->vehicle->vehicleModel->id, 'name' => $work_order->vehicle->vehicleModel->name]
                    : null,
            ]
            : null;

        $workOrdersIndexPath = parse_url(route('dashboard.services.work-orders.index'), PHP_URL_PATH) ?: '/dashboard/services/work-orders';

        return [
            'workOrder' => $work_order,
            'workOrdersIndexPath' => $workOrdersIndexPath,
            'photosIndexPath' => parse_url(route('dashboard.services.work-orders.photos.index', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'diagnoses' => $diagnoses,
            'diagnosesBasePath' => parse_url(route('dashboard.services.work-orders.diagnoses.store', ['work_order' => $work_order->id]), PHP_URL_PATH) ?: '',
            'technicians' => $technicians,
            'photos' => $photos->map(fn (WorkOrderPhoto $p) => [
                'id' => $p->id,
                'type' => $p->type,
                'path' => $p->path,
                'url' => $p->url,
                'caption' => $p->caption,
                'created_at' => $p->created_at?->toIso8601String(),
            ]),
            'typeLabels' => WorkOrderPhoto::$types,
            'photoStats' => $photoStats,
            'serviceChecklists' => $serviceChecklists->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'order_number' => $s->order_number,
            ]),
            'checklistResults' => $checklistResults,
            'initialClient' => $initialClient,
            'initialVehicle' => $initialVehicle,
            'services' => $services,
            'servicesTotal' => $services->sum('subtotal'),
            'servicesBasePath' => parse_url(route('dashboard.services.work-orders.services.store', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'applyPackagePath' => parse_url(route('dashboard.services.work-orders.services.apply-package', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'packagesForSelect' => $packagesForSelect,
            'productsForSelect' => $productsForSelect,
            'checklistResultsPath' => parse_url(route('dashboard.services.work-orders.checklist-results.update', ['work_order' => $work_order->id]), PHP_URL_PATH),
            'payments' => $payments->values(),
            'paymentsTotalPaid' => $payments->sum('amount'),
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
        ];
    }

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
                if ($line->product_id === null || $line->stock_deducted_at !== null) {
                    continue;
                }
                $qty = (int) round((float) $line->quantity);
                if ($qty <= 0) {
                    continue;
                }
                // Decrement atómico: evita race conditions entre procesos concurrentes.
                Product::where('id', $line->product_id)->where('stock', '>', 0)
                    ->decrement('stock', $qty);
                $line->update(['stock_deducted_at' => now()]);
            }
        });

        $ticketPrintUrl = route('dashboard.services.work-orders.tickets.print', [
            'work_order' => $work_order->id,
            'ticket' => $ticket->id,
        ]);

        return redirect()->route('dashboard.services.work-orders.config', ['work_order' => $work_order->id])
            ->with('flash', ['type' => 'success', 'message' => $wasNotInRepair ? 'Orden en reparación. Ticket generado.' : 'Ticket generado.'])
            ->with('ticket_id', $ticket->id)
            ->with('ticket_print_url', $ticketPrintUrl);
    }

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

            return [
                'description' => $label ?: 'Ítem',
                'quantity' => (float) $s->quantity,
                'unit_price' => (float) $s->unit_price,
                'subtotal' => (float) $s->subtotal,
            ];
        });

        $servicesTotal = (float) $work_order->services->sum('subtotal');
        $igvRate = (float) config('app.igv_rate', 0.18);
        $baseImponible = round($servicesTotal / (1 + $igvRate), 2);

        return view('thermal.work-order-ticket', [
            'work_order' => $work_order,
            'ticket' => $ticket,
            'services' => $services,
            'servicesTotal' => $servicesTotal,
            'baseImponible' => $baseImponible,
            'igv' => round($servicesTotal - $baseImponible, 2),
            'vehicleLabel' => $work_order->vehicle
                ? trim($work_order->vehicle->plate.' '.($work_order->vehicle->vehicleModel?->name ?? ''))
                : '—',
            'clientLabel' => $work_order->client
                ? trim($work_order->client->first_name.' '.$work_order->client->last_name)
                : '—',
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filename = 'ordenes-trabajo-'.now('America/Lima')->format('Y-m-d-His').'.xlsx';

        return Excel::download(new WorkOrdersExport($request), $filename, \Maatwebsite\Excel\Excel::XLSX);
    }

    public function index(Request $request): Response
    {
        /** @var LengthAwarePaginator $workOrders */
        $workOrders = $this->repository->paginatedList($request);

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

        $stats = Cache::remember('work_orders_stats', 60, fn () => [
            'total_work_orders' => WorkOrder::count(),
            'total_ingreso' => WorkOrder::where('status', 'ingreso')->count(),
        ]);

        $canExport = $request->user()?->can('work_orders.export');
        $exportUrl = null;
        if ($canExport) {
            $exportParams = array_filter($this->repository->getFiltersFromRequest($request), fn ($v) => $v !== null && $v !== '');
            $exportUrl = route('dashboard.services.work-orders.export', $exportParams);
        }

        return Inertia::render('services/work-orders/index', [
            'workOrders' => $workOrders,
            'filters' => $this->repository->getFiltersFromRequest($request),
            'workOrdersIndexPath' => parse_url(route('dashboard.services.work-orders.index'), PHP_URL_PATH) ?: '/dashboard/services/work-orders',
            'stats' => $stats,
            'can' => [
                'create' => $request->user()?->can('work_orders.create'),
                'update' => $request->user()?->can('work_orders.update'),
                'delete' => $request->user()?->can('work_orders.delete'),
                'view_photos' => $request->user()?->can('work_order_photos.view'),
                'export' => $canExport,
            ],
            'exportUrl' => $exportUrl,
        ]);
    }

    public function store(WorkOrderRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()?->id;
        $data['total_amount'] = 0;
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

        SendWelcomeNotificationJob::dispatch($workOrder->id);

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
        $workOrder->recalcTotalFromServices();

        $advance = (float) ($data['advance_payment_amount'] ?? 0);
        $initialPayment = $workOrder->payments()->where('is_initial_advance', true)->first();
        if ($initialPayment !== null) {
            $advance <= 0 ? $initialPayment->delete() : $initialPayment->update(['amount' => $advance]);
        } elseif ($advance > 0) {
            $nextNum = $workOrder->payments()->count() + 1;
            $workOrder->payments()->create([
                'type' => 'advance',
                'is_initial_advance' => true,
                'amount' => $advance,
                'payment_method' => null,
                'paid_at' => now(),
                'reference' => 'PAG-'.$workOrder->id.'-'.str_pad((string) $nextNum, 4, '0', STR_PAD_LEFT),
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

        $isFirstSave = ! $work_order->checklistResults()->exists();

        foreach ($request->validated('results') as $item) {
            WorkOrderChecklistResult::query()->updateOrCreate(
                ['work_order_id' => $work_order->id, 'service_checklist_id' => $item['service_checklist_id']],
                ['checked' => $item['checked'], 'note' => $item['note'] ?: null, 'completed_at' => $now, 'completed_by' => $userId]
            );
        }

        if ($isFirstSave) {
            $work_order->update(['status' => 'en_checklist']);
        }

        SendChecklistNotificationJob::dispatch($work_order->id, ! $isFirstSave);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Lista de chequeo actualizada correctamente.']);
    }

    public function searchClients(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));

        $query = \App\Models\User::query()
            ->select('id', 'first_name', 'last_name', 'document_number')
            ->whereHas('roles', fn ($r) => $r->where('name', 'cliente'));

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('first_name', 'like', '%'.$q.'%')
                    ->orWhere('last_name', 'like', '%'.$q.'%')
                    ->orWhere('document_number', 'like', '%'.$q.'%');
            });
        }

        $clients = $query->orderBy('first_name')->orderBy('last_name')->limit(30)->get();

        return response()->json($clients->map(fn ($c) => [
            'id' => $c->id,
            'first_name' => $c->first_name,
            'last_name' => $c->last_name,
            'document_number' => $c->document_number,
        ]));
    }

    public function searchVehicles(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));
        $clientId = $request->input('client_id');

        $query = Vehicle::query()
            ->with('vehicleModel:id,name')
            ->select('id', 'plate', 'vehicle_model_id', 'client_id');

        if ($clientId !== null && $clientId !== '') {
            $query->where('client_id', (int) $clientId);
        }

        if ($q !== '') {
            $query->where('plate', 'like', '%'.$q.'%');
        }

        $vehicles = $query->orderBy('plate')->limit(50)->get();

        return response()->json($vehicles->map(fn ($v) => [
            'id' => $v->id,
            'plate' => $v->plate,
            'vehicle_model_id' => $v->vehicle_model_id,
            'client_id' => $v->client_id,
            'vehicle_model' => $v->vehicleModel ? ['id' => $v->vehicleModel->id, 'name' => $v->vehicleModel->name] : null,
        ]));
    }
}
