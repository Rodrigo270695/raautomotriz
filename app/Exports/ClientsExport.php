<?php

namespace App\Exports;

use App\Models\User;
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

class ClientsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithEvents
{
    private const CLIENTE_ROLE = 'cliente';

    public function __construct(
        private Request $request
    ) {}

    public function query()
    {
        $query = User::query()
            ->withCount('vehicles')
            ->whereHas('roles', fn ($q) => $q->where('name', self::CLIENTE_ROLE));

        $search = $this->request->input('search');
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%')
                    ->orWhere('username', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('document_number', 'like', '%'.$search.'%');
            });
        }

        $filterStatus = $this->request->input('filter_status', 'all');
        if ($filterStatus === 'active') {
            $query->where('status', 'active');
        } elseif ($filterStatus === 'inactive') {
            $query->where('status', 'inactive');
        }

        $sortBy = $this->request->input('sort_by', 'first_name');
        $sortDir = $this->request->input('sort_dir', 'asc');
        $allowedSort = ['first_name', 'last_name', 'username', 'email', 'status'];
        if (in_array($sortBy, $allowedSort, true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('first_name');
        }

        return $query;
    }

    public function headings(): array
    {
        return ['Nombre', 'Apellido', 'Tipo de documento', 'Número de documento', 'Correo', 'Celular', 'Estado', 'Vehículos'];
    }

    /**
     * @param  User  $client
     */
    public function map($client): array
    {
        return [
            $client->first_name ?? '—',
            $client->last_name ?? '—',
            $client->document_type ?? '—',
            $client->document_number ?? $client->username ?? '—',
            $client->email ?? '—',
            $client->phone ?? '—',
            $client->status === 'active' ? 'Activo' : 'Inactivo',
            $client->vehicles_count ?? 0,
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $headerRange = 'A1:H1';

                $sheet->getStyle($headerRange)->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['argb' => 'FFFFFFFF'],
                        'size' => 12,
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF001F3F'], // Azul marino
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
