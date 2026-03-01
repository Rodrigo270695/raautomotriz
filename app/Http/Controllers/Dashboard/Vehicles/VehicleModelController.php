<?php

namespace App\Http\Controllers\Dashboard\Vehicles;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Vehicles\VehicleModelRequest;
use App\Models\Brand;
use App\Models\VehicleModel;
use Illuminate\Http\RedirectResponse;

class VehicleModelController extends Controller
{
    public function store(VehicleModelRequest $request, Brand $brand): RedirectResponse
    {
        $request->merge(['brand_id' => $brand->id]);

        $brand->vehicleModels()->create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status'),
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Modelo creado correctamente.']);
    }

    public function update(VehicleModelRequest $request, VehicleModel $vehicleModel): RedirectResponse
    {
        $vehicleModel->update([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status'),
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Modelo actualizado correctamente.']);
    }

    public function destroy(VehicleModel $vehicleModel): RedirectResponse
    {
        $vehicleModel->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Modelo eliminado correctamente.']);
    }
}
