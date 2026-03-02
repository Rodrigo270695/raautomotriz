<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\ServiceChecklistRequest;
use App\Models\ServiceChecklist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ServiceChecklistController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ServiceChecklist::query();

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

        $sortBy = $request->input('sort_by', 'order_number');
        $sortDir = $request->input('sort_dir', 'asc');
        if (in_array($sortBy, ['order_number', 'name', 'status', 'updated_at'], true) && in_array($sortDir, ['asc', 'desc'], true)) {
            if ($sortBy === 'order_number') {
                $query->orderByRaw($sortDir === 'asc' ? 'order_number IS NULL, order_number ASC' : 'order_number IS NULL DESC, order_number DESC');
            } else {
                $query->orderBy($sortBy, $sortDir);
            }
        } else {
            $query->orderByRaw('order_number IS NULL, order_number ASC')->orderBy('id');
        }

        $checklists = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $totalActive = ServiceChecklist::query()->where('status', 'active')->count();

        $checklistsIndexPath = parse_url(route('dashboard.services.checklists.index'), PHP_URL_PATH) ?: '/dashboard/services/checklists';

        $nextOrderNumber = ((int) ServiceChecklist::where('status', 'active')->max('order_number')) + 1;
        if ($nextOrderNumber < 1) {
            $nextOrderNumber = 1;
        }

        $maxActiveOrderNumber = (int) ServiceChecklist::where('status', 'active')->max('order_number');

        return Inertia::render('services/checklists/index', [
            'checklists' => $checklists,
            'next_order_number' => $nextOrderNumber,
            'max_active_order_number' => $maxActiveOrderNumber,
            'filters' => [
                'search' => $search,
                'per_page' => $request->input('per_page', 10),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'filter_status' => $filterStatus,
            ],
            'checklistsIndexPath' => $checklistsIndexPath,
            'stats' => [
                'total_checklists' => ServiceChecklist::count(),
                'total_active' => $totalActive,
            ],
            'can' => [
                'create' => $request->user()?->can('service_checklists.create'),
                'update' => $request->user()?->can('service_checklists.update'),
                'delete' => $request->user()?->can('service_checklists.delete'),
                'reorder' => $request->user()?->can('service_checklists.reorder'),
            ],
        ]);
    }

    public function store(ServiceChecklistRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['name'] = mb_strtoupper($data['name'], 'UTF-8');
        ServiceChecklist::create($data);

        $this->renumberActiveChecklists();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Lista de chequeo creada correctamente.']);
    }

    public function update(ServiceChecklistRequest $request, ServiceChecklist $checklist): RedirectResponse
    {
        $data = $request->validated();
        $data['name'] = mb_strtoupper($data['name'], 'UTF-8');

        if (($data['status'] ?? $checklist->status) === 'inactive') {
            $data['order_number'] = null;
        }

        $checklist->update($data);

        $this->renumberActiveChecklists();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Lista de chequeo actualizada correctamente.']);
    }

    /**
     * Renumera los registros activos a 1, 2, 3... Los inactivos quedan con order_number null.
     */
    private function renumberActiveChecklists(): void
    {
        $actives = ServiceChecklist::query()
            ->where('status', 'active')
            ->orderByRaw('COALESCE(order_number, 65535)')
            ->orderBy('id')
            ->get();

        foreach ($actives as $index => $checklist) {
            $checklist->update(['order_number' => $index + 1]);
        }

        Cache::forget('service_checklists_active');
    }

    public function destroy(ServiceChecklist $checklist): RedirectResponse
    {
        $checklist->delete();

        $this->renumberActiveChecklists();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Lista de chequeo eliminada correctamente.']);
    }

    public function moveUp(ServiceChecklist $checklist): RedirectResponse
    {
        if ($checklist->status !== 'active' || $checklist->order_number === null) {
            return redirect()->back()->with('flash', ['type' => 'error', 'message' => 'Solo se puede subir un registro activo.']);
        }
        if ($checklist->order_number <= 1) {
            return redirect()->back()->with('flash', ['type' => 'error', 'message' => 'Ya está en la primera posición.']);
        }

        $other = ServiceChecklist::query()
            ->where('status', 'active')
            ->where('order_number', $checklist->order_number - 1)
            ->first();

        if ($other) {
            $myNum = $checklist->order_number;
            $otherNum = $other->order_number;
            // Intercambio sin violar UNIQUE: liberar uno con null, luego asignar.
            $checklist->update(['order_number' => null]);
            $other->update(['order_number' => $myNum]);
            $checklist->update(['order_number' => $otherNum]);
        }

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Orden actualizado.']);
    }

    public function moveDown(ServiceChecklist $checklist): RedirectResponse
    {
        if ($checklist->status !== 'active' || $checklist->order_number === null) {
            return redirect()->back()->with('flash', ['type' => 'error', 'message' => 'Solo se puede bajar un registro activo.']);
        }

        $other = ServiceChecklist::query()
            ->where('status', 'active')
            ->where('order_number', $checklist->order_number + 1)
            ->first();

        if (!$other) {
            return redirect()->back()->with('flash', ['type' => 'error', 'message' => 'Ya está en la última posición.']);
        }

        $myNum = $checklist->order_number;
        $otherNum = $other->order_number;
        // Intercambio sin violar UNIQUE: liberar uno con null, luego asignar.
        $checklist->update(['order_number' => null]);
        $other->update(['order_number' => $myNum]);
        $checklist->update(['order_number' => $otherNum]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Orden actualizado.']);
    }
}
