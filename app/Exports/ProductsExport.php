<?php

namespace App\Exports;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ProductsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithEvents
{
    public function __construct(
        private readonly Request $request,
        private readonly ProductRepository $repository = new ProductRepository,
    ) {}

    public function query(): Builder
    {
        return $this->repository->filteredQuery($this->request);
    }

    public function headings(): array
    {
        $headings = [
            'Nombre', 'Descripción', 'Tipo', 'Marca',
            'P. venta', 'P. compra', 'Stock', 'Estado', 'Palabras clave',
        ];

        if ($this->request->user()?->can('products.view_audit')) {
            $headings[] = 'Creado / Modificado';
        }

        return $headings;
    }

    /** @param Product $product */
    public function map($product): array
    {
        $brand = $product->relationLoaded('inventoryBrand') ? $product->inventoryBrand : null;
        $type = $brand && $brand->relationLoaded('inventoryType') ? $brand->inventoryType : null;
        $keywords = $product->relationLoaded('keywords') ? $product->keywords->pluck('name')->implode(', ') : '';

        $row = [
            $product->name ?? '—',
            $product->description ?? '—',
            $type?->name ?? '—',
            $brand?->name ?? '—',
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
                    'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 12],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF001F3F']],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF001F3F']],
                    ],
                ]);

                $sheet->getRowDimension(1)->setRowHeight(22);
            },
        ];
    }
}
