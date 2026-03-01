<?php

namespace App\Http\Controllers\Dashboard\Vehicles;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Vehicles\BrandRequest;
use App\Models\Brand;
use App\Models\VehicleModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(Request $request): Response
    {
        $brands = Brand::query()->orderBy('name')->get();
        $vehicleModels = VehicleModel::query()->with('brand:id,name')->orderBy('name')->get();

        $brandsIndexPath = parse_url(route('dashboard.vehicles.brands.index'), PHP_URL_PATH) ?: '/dashboard/vehicles/brands';

        return Inertia::render('vehicles/brands/index', [
            'brands' => $brands,
            'vehicleModels' => $vehicleModels,
            'brandsIndexPath' => $brandsIndexPath,
            'can' => [
                'create_brand' => $request->user()?->can('brands.create'),
                'update_brand' => $request->user()?->can('brands.update'),
                'delete_brand' => $request->user()?->can('brands.delete'),
                'create_vehicle_model' => $request->user()?->can('vehicle_models.create'),
                'update_vehicle_model' => $request->user()?->can('vehicle_models.update'),
                'delete_vehicle_model' => $request->user()?->can('vehicle_models.delete'),
            ],
        ]);
    }

    public function store(BrandRequest $request): RedirectResponse
    {
        Brand::create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status'),
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Marca creada correctamente.']);
    }

    public function update(BrandRequest $request, Brand $brand): RedirectResponse
    {
        $brand->update([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status'),
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Marca actualizada correctamente.']);
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        $brand->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Marca eliminada correctamente.']);
    }
}
