<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\ServiceTypeRequest;
use App\Models\ServiceType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ServiceType::query();

        $search = $request->input('search');
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        }

        $filterStatus = $request->input('filter_status', 'all');
        if ($filterStatus === 'active') {
            $query->where('status', 'active');
        } elseif ($filterStatus === 'inactive') {
            $query->where('status', 'inactive');
        }

        $sortBy = $request->input('sort_by', 'name');
        $sortDir = $request->input('sort_dir', 'asc');
        if (in_array($sortBy, ['name', 'status', 'updated_at'], true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('name');
        }

        $types = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $totalActive = ServiceType::query()->where('status', 'active')->count();

        $typesIndexPath = parse_url(route('dashboard.services.types.index'), PHP_URL_PATH) ?: '/dashboard/services/types';

        return Inertia::render('services/types/index', [
            'types' => $types,
            'filters' => [
                'search' => $search,
                'per_page' => $request->input('per_page', 10),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'filter_status' => $filterStatus,
            ],
            'typesIndexPath' => $typesIndexPath,
            'stats' => [
                'total_types' => ServiceType::count(),
                'total_active' => $totalActive,
            ],
            'can' => [
                'create' => $request->user()?->can('service_types.create'),
                'update' => $request->user()?->can('service_types.update'),
                'delete' => $request->user()?->can('service_types.delete'),
            ],
        ]);
    }

    public function store(ServiceTypeRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['name'] = mb_strtoupper($data['name'], 'UTF-8');
        ServiceType::create($data);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Tipo de servicio creado correctamente.']);
    }

    public function update(ServiceTypeRequest $request, ServiceType $type): RedirectResponse
    {
        $data = $request->validated();
        $data['name'] = mb_strtoupper($data['name'], 'UTF-8');
        $type->update($data);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Tipo de servicio actualizado correctamente.']);
    }

    public function destroy(ServiceType $type): RedirectResponse
    {
        $type->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Tipo de servicio eliminado correctamente.']);
    }
}
