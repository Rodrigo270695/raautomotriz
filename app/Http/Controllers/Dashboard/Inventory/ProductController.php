<?php

namespace App\Http\Controllers\Dashboard\Inventory;

use App\Exports\ProductsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Inventory\ProductRequest;
use App\Models\InventoryBrand;
use App\Models\InventoryType;
use App\Models\Keyword;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()
            ->with([
                'inventoryBrand:id,name,inventory_type_id',
                'inventoryBrand.inventoryType:id,name',
                'keywords:id,name',
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name',
            ]);

        $search = $request->input('search');
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhereHas('keywords', fn ($q) => $q->where('name', 'like', '%'.$search.'%'))
                    ->orWhereHas('inventoryBrand', fn ($q) => $q->where('name', 'like', '%'.$search.'%'));
            });
        }

        $filterStatus = $request->input('filter_status', 'all');
        if ($filterStatus === 'active') {
            $query->where('status', 'active');
        } elseif ($filterStatus === 'inactive') {
            $query->where('status', 'inactive');
        }

        $filterTypeId = $request->input('filter_type_id');
        if ($filterTypeId !== null && $filterTypeId !== '') {
            $query->whereHas('inventoryBrand', fn ($q) => $q->where('inventory_type_id', (int) $filterTypeId));
        }

        $filterBrandId = $request->input('filter_brand_id');
        if ($filterBrandId !== null && $filterBrandId !== '') {
            $query->where('inventory_brand_id', (int) $filterBrandId);
        }

        $sortBy = $request->input('sort_by', 'name');
        $sortDir = $request->input('sort_dir', 'asc');
        $allowedSort = ['name', 'sale_price', 'purchase_price', 'stock', 'status', 'created_at'];
        if (in_array($sortBy, $allowedSort, true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('name');
        }

        $products = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $products->getCollection()->transform(function (Product $p) {
            $creator = $p->relationLoaded('createdBy') ? $p->createdBy : null;
            $updater = $p->relationLoaded('updatedBy') ? $p->updatedBy : null;
            $createdByName = $creator ? trim($creator->first_name.' '.$creator->last_name) : null;
            $updatedByName = $updater ? trim($updater->first_name.' '.$updater->last_name) : null;
            $p->setAttribute('created_by_name', $createdByName);
            $p->setAttribute('updated_by_name', $updatedByName);
            $p->setAttribute('audit_display', ($createdByName ?? '—').' / '.($updatedByName ?? '—'));

            return $p;
        });

        $baseQuery = Product::query();
        $inventoryTypesForSelect = InventoryType::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (InventoryType $t) => ['id' => $t->id, 'name' => $t->name]);

        $inventoryBrandsForSelect = InventoryBrand::query()
            ->where('status', 'active')
            ->orderBy('inventory_type_id')
            ->orderBy('name')
            ->get(['id', 'name', 'inventory_type_id'])
            ->map(fn (InventoryBrand $b) => [
                'id' => $b->id,
                'name' => $b->name,
                'inventory_type_id' => $b->inventory_type_id,
            ]);

        $productsIndexPath = parse_url(route('dashboard.inventory.products.index'), PHP_URL_PATH) ?: '/dashboard/inventory/products';

        $response = Inertia::render('inventory/products/index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
                'per_page' => $request->input('per_page', 10),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'filter_status' => $filterStatus,
                'filter_type_id' => $filterTypeId,
                'filter_brand_id' => $filterBrandId,
            ],
            'productsIndexPath' => $productsIndexPath,
            'inventoryTypesForSelect' => $inventoryTypesForSelect,
            'inventoryBrandsForSelect' => $inventoryBrandsForSelect,
            'stats' => [
                'total_products' => (clone $baseQuery)->count(),
                'active_products' => (clone $baseQuery)->where('status', 'active')->count(),
            ],
            'can' => [
                'create' => $request->user()?->can('products.create'),
                'update' => $request->user()?->can('products.update'),
                'delete' => $request->user()?->can('products.delete'),
                'export' => $request->user()?->can('products.export'),
                'view_audit' => $request->user()?->can('products.view_audit'),
            ],
            'exportUrl' => $request->user()?->can('products.export')
                ? route('dashboard.inventory.products.export', $request->only([
                    'search', 'filter_status', 'filter_type_id', 'filter_brand_id',
                    'sort_by', 'sort_dir',
                ]))
                : '',
        ]);

        return $response;
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filename = 'productos-'.now()->format('Y-m-d-His').'.xlsx';

        return Excel::download(new ProductsExport($request), $filename, \Maatwebsite\Excel\Excel::XLSX);
    }

    public function store(ProductRequest $request, InventoryBrand $inventory_brand): RedirectResponse
    {
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = $inventory_brand->products()->create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'sale_price' => $request->validated('sale_price'),
            'purchase_price' => $request->validated('purchase_price'),
            'stock' => (int) $request->validated('stock'),
            'image' => $imagePath,
            'status' => $request->validated('status'),
            'created_by_id' => $request->user()?->id,
            'updated_by_id' => $request->user()?->id,
        ]);

        $this->syncKeywords($product, $request->validated('keywords') ?? []);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Producto creado correctamente.']);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $data = [
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'sale_price' => $request->validated('sale_price'),
            'purchase_price' => $request->validated('purchase_price'),
            'stock' => (int) $request->validated('stock'),
            'status' => $request->validated('status'),
            'updated_by_id' => $request->user()?->id,
        ];

        if ($request->filled('inventory_brand_id')) {
            $data['inventory_brand_id'] = (int) $request->validated('inventory_brand_id');
        }

        if ($request->hasFile('image')) {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        $this->syncKeywords($product, $request->validated('keywords') ?? []);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Producto actualizado correctamente.']);
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Producto eliminado correctamente.']);
    }

    /**
     * @param  array<int, string>  $keywordNames
     */
    private function syncKeywords(Product $product, array $keywordNames): void
    {
        $names = array_values(array_unique(array_filter(array_map(function (string $name) {
            $t = trim($name);
            return $t === '' ? null : $t;
        }, $keywordNames))));

        $ids = collect($names)->map(function (string $name) {
            return Keyword::firstOrCreate(['name' => $name])->id;
        })->all();

        $product->keywords()->sync($ids);
    }
}
