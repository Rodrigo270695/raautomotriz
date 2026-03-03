<?php

namespace App\Exports;

use App\Models\WorkOrder;
use App\Repositories\AccountsReceivableRepository;
use Carbon\Carbon;
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

class AccountsReceivableExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithEvents
{
    private const COL_COUNT = 8;

    public function __construct(
        private readonly Request $request,
        private readonly AccountsReceivableRepository $repository = new AccountsReceivableRepository,
    ) {}

    public function query(): Builder
    {
        return $this->repository->filteredQuery($this->request);
    }

    public function headings(): array
    {
        return [
            '#',
            'Vehículo',
            'Placa',
            'Cliente',
            'F. Ingreso',
            'Estado',
            'Total (S/)',
            'Pagado (S/)',
            'Pendiente (S/)',
        ];
    }

    private const STATUS_LABELS = [
        'ingreso'            => 'Ingreso',
        'en_checklist'       => 'En checklist',
        'diagnosticado'      => 'Diagnosticado',
        'en_reparacion'      => 'En reparación',
        'listo_para_entregar'=> 'Listo para entregar',
        'entregado'          => 'Entregado',
    ];

    /** @param WorkOrder $workOrder */
    public function map($workOrder): array
    {
        $vehicle     = $workOrder->vehicle;
        $model       = $vehicle?->vehicleModel;
        $client      = $workOrder->client;
        $plate       = $vehicle?->plate ?? '—';
        $vehicleLabel = $model?->name ?? '—';
        $clientName  = $client
            ? trim(($client->first_name ?? '').' '.($client->last_name ?? ''))
            : '—';

        $entryDate = $workOrder->entry_date
            ? Carbon::parse($workOrder->entry_date)->format('d/m/Y')
            : '—';
        if ($workOrder->entry_time) {
            $entryDate .= ' '.substr($workOrder->entry_time, 0, 5);
        }

        $status  = self::STATUS_LABELS[$workOrder->status] ?? ucfirst(str_replace('_', ' ', $workOrder->status));
        $total   = (float) ($workOrder->total_amount ?? 0);
        $paid    = (float) ($workOrder->payments_sum_amount ?? 0);
        $pending = max(0, $total - $paid);

        return [
            $workOrder->id,
            $vehicleLabel,
            $plate,
            $clientName,
            $entryDate,
            $status,
            number_format($total, 2, '.', ''),
            number_format($paid, 2, '.', ''),
            number_format($pending, 2, '.', ''),
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet     = $event->sheet->getDelegate();
                $lastCol   = chr(64 + self::COL_COUNT + 1); // A=65, +1 because COL_COUNT is 8, last col is I
                $headerRange = 'A1:'.$lastCol.'1';

                $sheet->getStyle($headerRange)->applyFromArray([
                    'font' => [
                        'bold'  => true,
                        'color' => ['argb' => 'FFFFFFFF'],
                        'size'  => 12,
                    ],
                    'fill' => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF001F3F'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                        'vertical'   => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color'       => ['argb' => 'FF001F3F'],
                        ],
                    ],
                ]);

                $sheet->getRowDimension(1)->setRowHeight(22);
            },
        ];
    }
}
