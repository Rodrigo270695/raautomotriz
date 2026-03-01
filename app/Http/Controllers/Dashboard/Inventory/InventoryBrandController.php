<?php

namespace App\Http\Controllers\Dashboard\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Inventory\InventoryBrandRequest;
use App\Models\InventoryBrand;
use App\Models\InventoryType;
use Illuminate\Http\RedirectResponse;

class InventoryBrandController extends Controller
{
    public function store(InventoryBrandRequest $request, InventoryType $type): RedirectResponse
    {
        $request->merge(['inventory_type_id' => $type->id]);

        $type->inventoryBrands()->create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status'),
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Marca creada correctamente.']);
    }

    public function update(InventoryBrandRequest $request, InventoryBrand $inventoryBrand): RedirectResponse
    {
        $inventoryBrand->update([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status'),
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Marca actualizada correctamente.']);
    }

    public function destroy(InventoryBrand $inventoryBrand): RedirectResponse
    {
        $inventoryBrand->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Marca eliminada correctamente.']);
    }
}
