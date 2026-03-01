<?php

namespace App\Exports;

use App\Models\Vehicle;
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

class VehiclesExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithEvents
{
    public function __construct(
        private Request $request
    ) {}

    public function query()
    {
        $query = Vehicle::query()
            ->with([
                'vehicleModel.brand:id,name',
                'client:id,first_name,last_name,document_type,document_number,username,email,phone',
                'createdBy:id,first_name,last_name',
                'updatedBy:id,first_name,last_name',
            ]);

        $search = $this->request->input('search');
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('plate', 'like', '%'.$search.'%')
                    ->orWhere('color', 'like', '%'.$search.'%')
                    ->orWhereHas('client', function ($q) use ($search) {
                        $q->where('first_name', 'like', '%'.$search.'%')
                            ->orWhere('last_name', 'like', '%'.$search.'%')
                            ->orWhere('document_number', 'like', '%'.$search.'%');
                    })
                    ->orWhereHas('vehicleModel', function ($q) use ($search) {
                        $q->where('name', 'like', '%'.$search.'%')
                            ->orWhereHas('brand', function ($q) use ($search) {
                                $q->where('name', 'like', '%'.$search.'%');
                            });
                    });
            });
        }

        $filterStatus = $this->request->input('filter_status', 'all');
        if ($filterStatus === 'active') {
            $query->where('status', 'active');
        } elseif ($filterStatus === 'inactive') {
            $query->where('status', 'inactive');
        }

        $filterBrandId = $this->request->input('filter_brand_id');
        if ($filterBrandId !== null && $filterBrandId !== '') {
            $query->whereHas('vehicleModel', fn ($q) => $q->where('brand_id', (int) $filterBrandId));
        }
        $filterModelId = $this->request->input('filter_model_id');
        if ($filterModelId !== null && $filterModelId !== '') {
            $query->where('vehicle_model_id', (int) $filterModelId);
        }
        $filterClientId = $this->request->input('filter_client_id');
        if ($filterClientId !== null && $filterClientId !== '') {
            $query->where('client_id', (int) $filterClientId);
        }

        $sortBy = $this->request->input('sort_by', 'plate');
        $sortDir = $this->request->input('sort_dir', 'asc');
        $allowedSort = ['plate', 'year', 'color', 'entry_mileage', 'exit_mileage', 'status', 'created_at'];
        if (in_array($sortBy, $allowedSort, true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('plate');
        }

        return $query;
    }

    public function headings(): array
    {
        $headings = [
            'Placa',
            'Año',
            'Color',
            'Km entrada',
            'Km salida',
            'Marca',
            'Modelo',
            'Estado',
            'Cliente (nombre)',
            'Cliente (apellido)',
            'Tipo de documento',
            'Número de documento',
            'Correo',
            'Celular',
        ];
        if ($this->request->user()?->can('vehicles.view_audit')) {
            $headings[] = 'Creado / Modificado';
        }

        return $headings;
    }

    /**
     * @param  Vehicle  $vehicle
     */
    public function map($vehicle): array
    {
        $client = $vehicle->relationLoaded('client') ? $vehicle->client : null;
        $model = $vehicle->relationLoaded('vehicleModel') ? $vehicle->vehicleModel : null;
        $brand = $model && $model->relationLoaded('brand') ? $model->brand : null;

        $row = [
            $vehicle->plate ?? '—',
            $vehicle->year ?? '—',
            $vehicle->color ?? '—',
            $vehicle->entry_mileage !== null && $vehicle->entry_mileage !== '' ? $vehicle->entry_mileage : '—',
            $vehicle->exit_mileage !== null && $vehicle->exit_mileage !== '' ? $vehicle->exit_mileage : '—',
            $brand?->name ?? '—',
            $model?->name ?? '—',
            $vehicle->status === 'active' ? 'Activo' : 'Inactivo',
            $client?->first_name ?? '—',
            $client?->last_name ?? '—',
            $client?->document_type ?? '—',
            $client?->document_number ?? $client?->username ?? '—',
            $client?->email ?? '—',
            $client?->phone ?? '—',
        ];
        if ($this->request->user()?->can('vehicles.view_audit')) {
            $creator = $vehicle->relationLoaded('createdBy') ? $vehicle->createdBy : null;
            $updater = $vehicle->relationLoaded('updatedBy') ? $vehicle->updatedBy : null;
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
                $colCount = $this->request->user()?->can('vehicles.view_audit') ? 15 : 14;
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
