<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyVehiclesController extends Controller
{
    /**
     * Listado de vehículos del cliente actual.
     */
    public function index(Request $request): Response
    {
        $request->user()?->can('my_vehicles.view') || abort(403);

        $vehicles = Vehicle::query()
            ->where('client_id', $request->user()->id)
            ->with(['vehicleModel.brand'])
            ->orderBy('plate')
            ->get()
            ->map(fn (Vehicle $v) => [
                'id' => $v->id,
                'plate' => $v->plate,
                'year' => $v->year,
                'color' => $v->color,
                'entry_mileage' => $v->entry_mileage,
                'exit_mileage' => $v->exit_mileage,
                'vehicle_display' => $v->vehicleModel
                    ? trim(($v->vehicleModel->brand?->name ?? '') . ' ' . ($v->vehicleModel->name ?? ''))
                    : '—',
            ]);

        return Inertia::render('my-vehicles/index', [
            'vehicles' => $vehicles,
            'breadcrumbs' => [
                ['title' => 'Panel de control', 'href' => '/dashboard'],
                ['title' => 'Mis órdenes', 'href' => '#'],
                ['title' => 'Mis Vehículos', 'href' => route('dashboard.my-vehicles.index')],
            ],
        ]);
    }
}
