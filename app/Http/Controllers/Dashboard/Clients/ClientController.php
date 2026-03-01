<?php

namespace App\Http\Controllers\Dashboard\Clients;

use App\Exports\ClientsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Clients\ClientRequest;
use App\Models\Brand;
use App\Models\User;
use App\Models\VehicleModel;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ClientController extends Controller
{
    private const CLIENTE_ROLE = 'cliente';

    public function index(Request $request): Response
    {
        $query = User::query()
            ->withCount(['roles', 'vehicles'])
            ->whereHas('roles', fn ($q) => $q->where('name', self::CLIENTE_ROLE));

        $search = $request->input('search');
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%')
                    ->orWhere('username', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('document_number', 'like', '%'.$search.'%');
            });
        }

        $filterStatus = $request->input('filter_status', 'all');
        if ($filterStatus === 'active') {
            $query->where('status', 'active');
        } elseif ($filterStatus === 'inactive') {
            $query->where('status', 'inactive');
        }

        $sortBy = $request->input('sort_by', 'first_name');
        $sortDir = $request->input('sort_dir', 'asc');
        $allowedSort = ['first_name', 'last_name', 'username', 'email', 'status'];
        if (in_array($sortBy, $allowedSort, true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('first_name');
        }

        $clients = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $baseQuery = User::query()->whereHas('roles', fn ($q) => $q->where('name', self::CLIENTE_ROLE));
        $lastUpdated = (clone $baseQuery)->latest('updated_at')->value('updated_at');
        $lastUpdatedFormatted = $lastUpdated ? Carbon::parse($lastUpdated)->diffForHumans() : null;

        $clientsIndexPath = parse_url(route('dashboard.clients.index'), PHP_URL_PATH) ?: '/dashboard/users/clients';
        $vehiclesIndexPath = parse_url(route('dashboard.vehicles.vehicles.index'), PHP_URL_PATH) ?: '/dashboard/vehicles/vehicles';

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

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'vehiclesIndexPath' => $vehiclesIndexPath,
            'brandsForSelect' => $brandsForSelect,
            'vehicleModelsForSelect' => $vehicleModelsForSelect,
            'clientsForSelect' => $clientsForSelect,
            'filters' => [
                'search' => $search,
                'per_page' => $request->input('per_page', 10),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'filter_status' => $filterStatus,
            ],
            'clientsIndexPath' => $clientsIndexPath,
            'stats' => [
                'total_clients' => (clone $baseQuery)->count(),
                'active_clients' => (clone $baseQuery)->where('status', 'active')->count(),
                'last_updated' => $lastUpdatedFormatted,
            ],
            'can' => [
                'create' => $request->user()?->can('clients.create'),
                'update' => $request->user()?->can('clients.update'),
                'delete' => $request->user()?->can('clients.delete'),
                'add_vehicle' => $request->user()?->can('clients.add_vehicle'),
                'export' => $request->user()?->can('clients.export'),
            ],
            'exportUrl' => $request->user()?->can('clients.export')
                ? route('dashboard.clients.export', $request->only(['search', 'filter_status', 'sort_by', 'sort_dir']))
                : '',
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filename = 'clientes-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new ClientsExport($request), $filename, \Maatwebsite\Excel\Excel::XLSX);
    }

    public function store(ClientRequest $request): RedirectResponse
    {
        $user = User::create([
            'first_name' => $request->validated('first_name'),
            'last_name' => $request->validated('last_name'),
            'document_type' => $request->validated('document_type'),
            'document_number' => $request->validated('document_number'),
            'username' => $request->validated('document_number'), // El cliente inicia sesión por DNI
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'status' => $request->validated('status'),
            'password' => $request->validated('password'),
        ]);

        $user->assignRole(self::CLIENTE_ROLE);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Cliente creado correctamente.']);
    }

    public function update(ClientRequest $request, User $user): RedirectResponse
    {
        if (! $user->hasRole(self::CLIENTE_ROLE)) {
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => 'El usuario no es un cliente.']);
        }

        $data = [
            'first_name' => $request->validated('first_name'),
            'last_name' => $request->validated('last_name'),
            'document_type' => $request->validated('document_type'),
            'document_number' => $request->validated('document_number'),
            'username' => $request->validated('document_number'), // Mantener login por DNI
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'status' => $request->validated('status'),
        ];
        if ($request->filled('password')) {
            $data['password'] = $request->validated('password');
        }
        $user->update($data);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Cliente actualizado correctamente.']);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if (! $user->hasRole(self::CLIENTE_ROLE)) {
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => 'El usuario no es un cliente.']);
        }

        if ($user->id === $request->user()?->id) {
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => 'No puede eliminar su propio usuario.']);
        }

        $user->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Cliente eliminado correctamente.']);
    }
}
