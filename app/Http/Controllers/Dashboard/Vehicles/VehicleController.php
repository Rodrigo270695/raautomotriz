<?php

namespace App\Http\Controllers\Dashboard\Vehicles;

use App\Exports\VehiclesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Vehicles\VehicleRequest;
use App\Models\Brand;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleModel;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class VehicleController extends Controller
{
    private const CLIENTE_ROLE = 'cliente';

    public function index(Request $request): Response
    {
        $query = Vehicle::query()
            ->with([
                'vehicleModel.brand:id,name',
                'client:id,first_name,last_name',
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name',
            ]);

        $search = $request->input('search');
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('plate', 'like', '%'.$search.'%')
                    ->orWhere('color', 'like', '%'.$search.'%')
                    ->orWhereHas('client', function ($q) use ($search) {
                        $q->where('first_name', 'like', '%'.$search.'%')
                            ->orWhere('last_name', 'like', '%'.$search.'%')
                            ->orWhere('document_number', 'like', '%'.$search.'%');
                    })
                    ->orWhereHas('vehicleModel', function ($q) use ($search) {
                        $q->where('name', 'like', '%'.$search.'%')
                            ->orWhereHas('brand', function ($q) use ($search) {
                                $q->where('name', 'like', '%'.$search.'%');
                            });
                    });
            });
        }

        $filterStatus = $request->input('filter_status', 'all');
        if ($filterStatus === 'active') {
            $query->where('status', 'active');
        } elseif ($filterStatus === 'inactive') {
            $query->where('status', 'inactive');
        }

        $filterBrandId = $request->input('filter_brand_id');
        if ($filterBrandId !== null && $filterBrandId !== '') {
            $query->whereHas('vehicleModel', fn ($q) => $q->where('brand_id', (int) $filterBrandId));
        }
        $filterModelId = $request->input('filter_model_id');
        if ($filterModelId !== null && $filterModelId !== '') {
            $query->where('vehicle_model_id', (int) $filterModelId);
        }

        $filterClientId = $request->input('filter_client_id');
        if ($filterClientId !== null && $filterClientId !== '') {
            $query->where('client_id', (int) $filterClientId);
        }

        $sortBy = $request->input('sort_by', 'plate');
        $sortDir = $request->input('sort_dir', 'asc');
        $allowedSort = ['plate', 'year', 'color', 'entry_mileage', 'exit_mileage', 'status', 'created_at'];
        if (in_array($sortBy, $allowedSort, true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('plate');
        }

        $vehicles = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $vehicles->getCollection()->transform(function (Vehicle $v) {
            $creator = $v->relationLoaded('createdBy') ? $v->createdBy : null;
            $updater = $v->relationLoaded('updatedBy') ? $v->updatedBy : null;
            $createdByName = $creator ? trim($creator->first_name.' '.$creator->last_name) : null;
            $updatedByName = $updater ? trim($updater->first_name.' '.$updater->last_name) : null;
            $v->setAttribute('created_by_name', $createdByName);
            $v->setAttribute('updated_by_name', $updatedByName);
            $v->setAttribute('audit_display', ($createdByName ?? '—').' / '.($updatedByName ?? '—'));

            return $v;
        });

        $baseQuery = Vehicle::query();
        $lastUpdated = (clone $baseQuery)->latest('updated_at')->value('updated_at');
        $lastUpdatedFormatted = $lastUpdated ? Carbon::parse($lastUpdated)->diffForHumans() : null;

        $brandsForSelect = Brand::query()
            ->whereRaw('LOWER(status) = ?', ['active'])
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Brand $b) => ['id' => $b->id, 'name' => $b->name]);

        $vehicleModelsForSelect = VehicleModel::query()
            ->whereRaw('LOWER(vehicle_models.status) = ?', ['active'])
            ->whereHas('brand', fn ($q) => $q->whereRaw('LOWER(status) = ?', ['active']))
            ->with('brand:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'brand_id'])
            ->map(fn (VehicleModel $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'brand_id' => $m->brand_id,
                'brand_name' => $m->relationLoaded('brand') ? $m->brand->name : '',
            ]);

        $clientsForSelect = User::query()
            ->whereRaw('LOWER(status) = ?', ['active'])
            ->whereHas('roles', fn ($q) => $q->where('name', self::CLIENTE_ROLE))
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'document_number'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'first_name' => $u->first_name ?? '',
                'last_name' => $u->last_name ?? '',
                'document_number' => $u->document_number ?? '',
            ]);

        $vehiclesIndexPath = parse_url(route('dashboard.vehicles.vehicles.index'), PHP_URL_PATH) ?: '/dashboard/vehicles/vehicles';

        return Inertia::render('vehicles/vehicles/index', [
            'vehicles' => $vehicles,
            'filters' => [
                'search' => $search,
                'per_page' => $request->input('per_page', 10),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'filter_status' => $filterStatus,
                'filter_brand_id' => $filterBrandId,
                'filter_model_id' => $filterModelId,
                'filter_client_id' => $filterClientId,
            ],
            'vehiclesIndexPath' => $vehiclesIndexPath,
            'brandsForSelect' => $brandsForSelect,
            'vehicleModelsForSelect' => $vehicleModelsForSelect,
            'clientsForSelect' => $clientsForSelect,
            'stats' => [
                'total_vehicles' => (clone $baseQuery)->count(),
                'active_vehicles' => (clone $baseQuery)->where('status', 'active')->count(),
                'last_updated' => $lastUpdatedFormatted,
            ],
            'can' => [
                'create' => $request->user()?->can('vehicles.create'),
                'update' => $request->user()?->can('vehicles.update'),
                'delete' => $request->user()?->can('vehicles.delete'),
                'export' => $request->user()?->can('vehicles.export'),
                'view_audit' => $request->user()?->can('vehicles.view_audit'),
            ],
            'exportUrl' => $request->user()?->can('vehicles.export')
                ? route('dashboard.vehicles.vehicles.export', $request->only([
                    'search', 'filter_status', 'filter_brand_id', 'filter_model_id', 'filter_client_id',
                    'sort_by', 'sort_dir',
                ]))
                : '',
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filename = 'vehiculos-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new VehiclesExport($request), $filename, \Maatwebsite\Excel\Excel::XLSX);
    }

    public function store(VehicleRequest $request): RedirectResponse
    {
        Vehicle::create([
            'plate' => $request->validated('plate'),
            'year' => $request->validated('year'),
            'color' => $request->validated('color'),
            'entry_mileage' => $request->validated('entry_mileage'),
            'exit_mileage' => $request->validated('exit_mileage'),
            'vehicle_model_id' => $request->validated('vehicle_model_id'),
            'client_id' => $request->validated('client_id'),
            'status' => $request->validated('status'),
            'created_by_id' => $request->user()?->id,
        ]);

        $redirectClientId = $request->input('redirect_to_vehicles_filter_client_id');
        if ($redirectClientId !== null && $redirectClientId !== '') {
            return redirect()->route('dashboard.vehicles.vehicles.index', ['filter_client_id' => $redirectClientId])
                ->with('flash', ['type' => 'success', 'message' => 'Vehículo registrado correctamente.']);
        }

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Vehículo registrado correctamente.']);
    }

    public function update(VehicleRequest $request, Vehicle $vehicle): RedirectResponse
    {
        $vehicle->update([
            'plate' => $request->validated('plate'),
            'year' => $request->validated('year'),
            'color' => $request->validated('color'),
            'entry_mileage' => $request->validated('entry_mileage'),
            'exit_mileage' => $request->validated('exit_mileage'),
            'vehicle_model_id' => $request->validated('vehicle_model_id'),
            'client_id' => $request->validated('client_id'),
            'status' => $request->validated('status'),
            'updated_by_id' => $request->user()?->id,
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Vehículo actualizado correctamente.']);
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        $vehicle->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Vehículo eliminado correctamente.']);
    }
}
