<?php

namespace App\Exports;

use App\Models\Product;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ProductsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithEvents
{
    public function __construct(
        private Request $request
    ) {}

    public function query()
    {
        $query = Product::query()
            ->with([
                'inventoryBrand:id,name,inventory_type_id',
                'inventoryBrand.inventoryType:id,name',
                'keywords:id,name',
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name',
            ]);

        $search = $this->request->input('search');
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhereHas('keywords', fn ($q) => $q->where('name', 'like', '%'.$search.'%'))
                    ->orWhereHas('inventoryBrand', fn ($q) => $q->where('name', 'like', '%'.$search.'%'));
            });
        }

        $filterStatus = $this->request->input('filter_status', 'all');
        if ($filterStatus === 'active') {
            $query->where('status', 'active');
        } elseif ($filterStatus === 'inactive') {
            $query->where('status', 'inactive');
        }

        $filterTypeId = $this->request->input('filter_type_id');
        if ($filterTypeId !== null && $filterTypeId !== '') {
            $query->whereHas('inventoryBrand', fn ($q) => $q->where('inventory_type_id', (int) $filterTypeId));
        }

        $filterBrandId = $this->request->input('filter_brand_id');
        if ($filterBrandId !== null && $filterBrandId !== '') {
            $query->where('inventory_brand_id', (int) $filterBrandId);
        }

        $sortBy = $this->request->input('sort_by', 'name');
        $sortDir = $this->request->input('sort_dir', 'asc');
        $allowedSort = ['name', 'sale_price', 'purchase_price', 'stock', 'status', 'created_at'];
        if (in_array($sortBy, $allowedSort, true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('name');
        }

        return $query;
    }

    public function headings(): array
    {
        $headings = [
            'Nombre',
            'Descripción',
            'Tipo',
            'Marca',
            'P. venta',
            'P. compra',
            'Stock',
            'Estado',
            'Palabras clave',
        ];
        if ($this->request->user()?->can('products.view_audit')) {
            $headings[] = 'Creado / Modificado';
        }

        return $headings;
    }

    /**
     * @param  Product  $product
     */
    public function map($product): array
    {
        $brand = $product->relationLoaded('inventoryBrand') ? $product->inventoryBrand : null;
        $type = $brand && $brand->relationLoaded('inventoryType') ? $brand->inventoryType : null;
        $typeName = $type?->name ?? '—';
        $brandName = $brand?->name ?? '—';
        $keywords = $product->relationLoaded('keywords') ? $product->keywords->pluck('name')->implode(', ') : '';

        $row = [
            $product->name ?? '—',
            $product->description ?? '—',
            $typeName,
            $brandName,
            $product->sale_price ?? '—',
            $product->purchase_price ?? '—',
            $product->stock ?? 0,
            $product->status === 'active' ? 'Activo' : 'Inactivo',
            $keywords ?: '—',
        ];
        if ($this->request->user()?->can('products.view_audit')) {
            $creator = $product->relationLoaded('createdBy') ? $product->createdBy : null;
            $updater = $product->relationLoaded('updatedBy') ? $product->updatedBy : null;
            $createdByName = $creator ? trim($creator->first_name.' '.$creator->last_name) : null;
            $updatedByName = $updater ? trim($updater->first_name.' '.$updater->last_name) : null;
            $row[] = ($createdByName ?? '—').' / '.($updatedByName ?? '—');
        }

        return $row;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $colCount = $this->request->user()?->can('products.view_audit') ? 10 : 9;
                $headerRange = 'A1:'.chr(64 + $colCount).'1';

                $sheet->getStyle($headerRange)->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['argb' => 'FFFFFFFF'],
                        'size' => 12,
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF001F3F'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FF001F3F'],
                        ],
                    ],
                ]);

                $sheet->getRowDimension(1)->setRowHeight(22);
            },
        ];
    }
}
