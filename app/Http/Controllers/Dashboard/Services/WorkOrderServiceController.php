<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\WorkOrderServiceRequest;
use App\Models\Product;
use App\Models\ServicePackage;
use App\Models\WorkOrder;
use App\Models\WorkOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WorkOrderServiceController extends Controller
{
    public function store(WorkOrderServiceRequest $request, WorkOrder $work_order): RedirectResponse
    {
        $data = $request->validated();

        $quantity = (float) $data['quantity'];
        $unitPrice = (float) $data['unit_price'];

        // Evitar duplicados:
        // - Si viene product_id: cualquier línea (de paquete o manual) con ese producto se acumula.
        // - Si NO viene product_id: solo se acumulan líneas manuales (sin paquete) con la misma descripción.
        /** @var \App\Models\WorkOrderService|null $existing */
        $existing = null;

        if (! empty($data['product_id'])) {
            $existing = $work_order->services()
                ->where('product_id', $data['product_id'])
                ->orderBy('id')
                ->first();
        } else {
            $existing = $work_order->services()
                ->whereNull('service_package_item_id')
                ->whereNull('product_id')
                ->where('description', $data['description'])
                ->orderBy('id')
                ->first();
        }

        $lineType = isset($data['type']) && in_array($data['type'], ['product', 'service'], true)
            ? $data['type']
            : (! empty($data['product_id']) ? 'product' : 'service');

        if ($existing) {
            $newQuantity = (float) $existing->quantity + $quantity;
            $existingUnitPrice = (float) $existing->unit_price;

            $existing->update([
                'quantity' => $newQuantity,
                'subtotal' => $newQuantity * $existingUnitPrice,
            ]);
            $work_order->recalcTotalFromServices();
        } else {
            $work_order->services()->create([
                'product_id' => $data['product_id'] ?? null,
                'type' => $lineType,
                'description' => $data['description'],
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => $quantity * $unitPrice,
            ]);
        }

        $work_order->recalcTotalFromServices();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Servicio agregado correctamente a la orden.']);
    }

    public function update(WorkOrderServiceRequest $request, WorkOrder $work_order, WorkOrderService $service): RedirectResponse
    {
        if ($service->work_order_id !== (int) $work_order->id) {
            abort(404);
        }

        $data = $request->validated();

        $quantity = (float) $data['quantity'];
        $unitPrice = (float) $data['unit_price'];

        $service->update([
            'description' => $data['description'],
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $quantity * $unitPrice,
        ]);

        $work_order->recalcTotalFromServices();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Servicio de la orden actualizado correctamente.']);
    }

    public function destroy(WorkOrder $work_order, WorkOrderService $service): RedirectResponse
    {
        if ($service->work_order_id !== (int) $work_order->id) {
            abort(404);
        }

        if (! $this->userCanDelete()) {
            abort(403);
        }

        $service->delete();

        $work_order->recalcTotalFromServices();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Servicio eliminado correctamente de la orden.']);
    }

    private function userCanDelete(): bool
    {
        $user = request()->user();

        return $user?->can('work_order_services.delete') ?? false;
    }

    public function applyPackage(Request $request, WorkOrder $work_order): RedirectResponse
    {
        $validated = $request->validate([
            'service_package_id' => ['required', 'integer', 'exists:service_packages,id'],
        ]);

        /** @var \App\Models\ServicePackage $package */
        $package = ServicePackage::query()
            ->with('items')
            ->where('status', 'active')
            ->findOrFail($validated['service_package_id']);

        $stockWarnings = [];
        foreach ($package->items as $item) {
            if (empty($item->product_id)) {
                continue;
            }
            $product = Product::find($item->product_id);
            if (! $product) {
                continue;
            }
            $pendingQty = (float) WorkOrderService::query()
                ->where('product_id', $item->product_id)
                ->whereNull('stock_deducted_at')
                ->sum('quantity');
            $available = (int) $product->stock - (int) round($pendingQty, 0);
            $needed = (int) round((float) $item->quantity, 0);
            if ($available < $needed) {
                $stockWarnings[] = $product->name.($available < 0 ? ' (sin stock)' : ' (stock insuficiente)');
            }
        }

        foreach ($package->items as $item) {
            $quantity = (float) $item->quantity;
            $unitPrice = (float) $item->unit_price;

            $work_order->services()->create([
                'service_package_id' => $package->id,
                'service_package_item_id' => $item->id,
                'product_id' => $item->product_id,
                'type' => 'product',
                'description' => $item->notes,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => $quantity * $unitPrice,
            ]);
        }

        $work_order->recalcTotalFromServices();

        $redirect = redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Paquete aplicado correctamente a la orden.']);

        if (count($stockWarnings) > 0) {
            $redirect->with('flash_stock_warnings', array_values(array_unique($stockWarnings)));
        }

        return $redirect;
    }
}
