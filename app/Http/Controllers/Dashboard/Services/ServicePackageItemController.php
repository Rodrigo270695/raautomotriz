<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\ServicePackageItemRequest;
use App\Models\Product;
use App\Models\ServicePackage;
use App\Models\ServicePackageItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ServicePackageItemController extends Controller
{
    public function index(Request $request, ServicePackage $service_package): Response
    {
        $service_package->load('serviceType:id,name');

        $items = ServicePackageItem::query()
            ->where('service_package_id', $service_package->id)
            ->with(['product.inventoryBrand:id,name'])
            ->orderBy('id')
            ->get()
            ->map(fn (ServicePackageItem $item) => [
                'id' => $item->id,
                'type' => $item->type,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'product_brand_name' => $item->product?->inventoryBrand?->name,
                'quantity' => (float) $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'notes' => $item->notes,
            ]);

        $packagesIndexPath = parse_url(route('dashboard.services.packages.index'), PHP_URL_PATH) ?: '/dashboard/services/packages';

        $productsForSelect = Product::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->with('inventoryBrand:id,name')
            ->get(['id', 'name', 'sale_price', 'purchase_price', 'inventory_brand_id'])
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'brand_name' => $p->inventoryBrand?->name,
                'sale_price' => (float) $p->sale_price,
                'purchase_price' => $p->purchase_price !== null ? (float) $p->purchase_price : null,
            ]);

        return Inertia::render('services/packages/items/index', [
            'servicePackage' => [
                'id' => $service_package->id,
                'name' => $service_package->name,
                'status' => $service_package->status,
                'service_type_name' => $service_package->serviceType?->name,
            ],
            'items' => $items,
            'productsForSelect' => $productsForSelect,
            'packagesIndexPath' => $packagesIndexPath,
            'can' => [
                'view' => $request->user()?->can('service_package_items.view'),
                'create' => $request->user()?->can('service_package_items.create'),
                'update' => $request->user()?->can('service_package_items.update'),
                'delete' => $request->user()?->can('service_package_items.delete'),
            ],
        ]);
    }

    public function store(ServicePackageItemRequest $request, ServicePackage $service_package): RedirectResponse
    {
        $data = $request->validated();
        $data['service_package_id'] = $service_package->id;
        $data['type'] = 'product';

        ServicePackageItem::create($data);
        Cache::forget('packages_for_select');

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Ítem agregado al paquete correctamente.']);
    }

    public function update(ServicePackageItemRequest $request, ServicePackage $service_package, ServicePackageItem $item): RedirectResponse
    {
        if ($item->service_package_id !== (int) $service_package->id) {
            abort(404);
        }

        $data = $request->validated();
        $data['type'] = 'product';

        $item->update($data);
        Cache::forget('packages_for_select');

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Ítem del paquete actualizado correctamente.']);
    }

    public function destroy(Request $request, ServicePackage $service_package, ServicePackageItem $item): RedirectResponse
    {
        if ($item->service_package_id !== (int) $service_package->id) {
            abort(404);
        }

        $item->delete();
        Cache::forget('packages_for_select');

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Ítem del paquete eliminado correctamente.']);
    }
}

