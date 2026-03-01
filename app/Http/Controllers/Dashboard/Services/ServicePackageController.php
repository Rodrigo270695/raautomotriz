<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\ServicePackageRequest;
use App\Models\ServicePackage;
use App\Models\ServiceType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServicePackageController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ServicePackage::query()->with([
            'serviceType:id,name',
            'items:id,service_package_id,quantity,unit_price',
        ]);

        $search = $request->input('search');
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhereHas('serviceType', fn ($q) => $q->where('name', 'like', '%'.$search.'%'));
            });
        }

        $filterStatus = $request->input('filter_status', 'all');
        if ($filterStatus === 'active') {
            $query->where('status', 'active');
        } elseif ($filterStatus === 'inactive') {
            $query->where('status', 'inactive');
        }

        $sortBy = $request->input('sort_by', 'sort_order');
        $sortDir = $request->input('sort_dir', 'asc');
        if (in_array($sortBy, ['name', 'status', 'sort_order', 'updated_at'], true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('sort_order')->orderBy('name');
        }

        $packages = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $packages->getCollection()->transform(function (ServicePackage $p) {
            $itemsPath = parse_url(route('dashboard.services.packages.items.index', ['service_package' => $p->id]), PHP_URL_PATH) ?: '';
            $p->setAttribute('items_path', $itemsPath);

            $total = $p->items
                ? $p->items->reduce(
                    fn (float $carry, $item) => $carry + ((float) $item->quantity * (float) $item->unit_price),
                    0.0
                )
                : 0.0;
            $p->setAttribute('total_amount', round($total, 2));

            return $p;
        });

        $totalActive = ServicePackage::query()->where('status', 'active')->count();

        $packagesIndexPath = parse_url(route('dashboard.services.packages.index'), PHP_URL_PATH) ?: '/dashboard/services/packages';

        // Tipos de servicio activos (el frontend mostrará solo Preventivo / Correctivo)
        $serviceTypesForSelect = ServiceType::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (ServiceType $t) => ['id' => $t->id, 'name' => $t->name]);

        $maxSortOrder = ServicePackage::max('sort_order');
        $nextSortOrder = $maxSortOrder ? ((int) $maxSortOrder + 1) : 1;

        return Inertia::render('services/packages/index', [
            'packages' => $packages,
            'filters' => [
                'search' => $search,
                'per_page' => $request->input('per_page', 10),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'filter_status' => $filterStatus,
            ],
            'packagesIndexPath' => $packagesIndexPath,
            'serviceTypesForSelect' => $serviceTypesForSelect,
            'stats' => [
                'total_packages' => ServicePackage::count(),
                'total_active' => $totalActive,
            ],
            'nextSortOrder' => $nextSortOrder,
            'can' => [
                'create' => $request->user()?->can('service_packages.create'),
                'update' => $request->user()?->can('service_packages.update'),
                'delete' => $request->user()?->can('service_packages.delete'),
                'view_items' => $request->user()?->can('service_package_items.view'),
            ],
        ]);
    }

    public function store(ServicePackageRequest $request): RedirectResponse
    {
        $maxSortOrder = ServicePackage::max('sort_order');
        $nextSortOrder = $maxSortOrder ? ((int) $maxSortOrder + 1) : 1;

        $data = $request->validated();
        $data['name'] = mb_strtoupper($data['name'], 'UTF-8');
        $data['service_type_id'] = (int) $data['service_type_id'];
        $data['sort_order'] = $nextSortOrder;

        ServicePackage::create($data);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Paquete de servicio creado correctamente.']);
    }

    public function update(ServicePackageRequest $request, ServicePackage $package): RedirectResponse
    {
        $data = $request->validated();
        $data['name'] = mb_strtoupper($data['name'], 'UTF-8');
        $data['service_type_id'] = (int) $data['service_type_id'];
        $data['sort_order'] = (int) ($data['sort_order'] ?? $package->sort_order ?? 0);

        $package->update($data);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Paquete de servicio actualizado correctamente.']);
    }

    public function destroy(ServicePackage $package): RedirectResponse
    {
        $package->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Paquete de servicio eliminado correctamente.']);
    }
}
