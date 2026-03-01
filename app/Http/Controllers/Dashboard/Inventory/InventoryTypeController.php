<?php

namespace App\Http\Controllers\Dashboard\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Inventory\InventoryTypeRequest;
use App\Models\InventoryBrand;
use App\Models\InventoryType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $types = InventoryType::query()->orderBy('name')->get();
        $inventoryBrands = InventoryBrand::query()
            ->with('inventoryType:id,name')
            ->orderBy('name')
            ->get();

        $typesIndexPath = parse_url(route('dashboard.inventory.types.index'), PHP_URL_PATH) ?: '/dashboard/inventory/types';

        return Inertia::render('inventory/types/index', [
            'types' => $types,
            'inventoryBrands' => $inventoryBrands,
            'typesIndexPath' => $typesIndexPath,
            'can' => [
                'create_type' => $request->user()?->can('inventory_types.create'),
                'update_type' => $request->user()?->can('inventory_types.update'),
                'delete_type' => $request->user()?->can('inventory_types.delete'),
                'create_brand' => $request->user()?->can('inventory_brands.create'),
                'update_brand' => $request->user()?->can('inventory_brands.update'),
                'delete_brand' => $request->user()?->can('inventory_brands.delete'),
            ],
        ]);
    }

    public function store(InventoryTypeRequest $request): RedirectResponse
    {
        InventoryType::create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status'),
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Tipo creado correctamente.']);
    }

    public function update(InventoryTypeRequest $request, InventoryType $type): RedirectResponse
    {
        $type->update([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status'),
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Tipo actualizado correctamente.']);
    }

    public function destroy(InventoryType $type): RedirectResponse
    {
        $type->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Tipo eliminado correctamente.']);
    }
}
