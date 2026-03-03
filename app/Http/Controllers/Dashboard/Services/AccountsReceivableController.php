<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Exports\AccountsReceivableExport;
use App\Http\Controllers\Controller;
use App\Repositories\AccountsReceivableRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AccountsReceivableController extends Controller
{
    public function __construct(
        private readonly AccountsReceivableRepository $repository = new AccountsReceivableRepository,
    ) {}

    public function index(Request $request): Response
    {
        $workOrders = $this->repository->paginatedList($request);
        $filters    = $this->repository->getFiltersFromRequest($request);
        $stats      = $this->repository->stats($request);

        $canExport = $request->user()?->can('accounts_receivable.export');
        $exportUrl = null;
        if ($canExport) {
            $exportParams = array_filter($filters, fn ($v) => $v !== null && $v !== '');
            $exportUrl = route('dashboard.services.accounts-receivable.export', $exportParams);
        }

        $workOrders->getCollection()->transform(function ($wo) {
            $paid = (float) ($wo->payments_sum_amount ?? 0);
            $wo->setAttribute('total_paid', $paid);
            $wo->setAttribute('pending_amount', max(0, (float) $wo->total_amount - $paid));

            return $wo;
        });

        $clientSummary = $this->repository->clientSummary($filters['search'] ?? null);

        return Inertia::render('services/accounts-receivable/index', [
            'workOrders'     => $workOrders,
            'filters'        => $filters,
            'stats'          => $stats,
            'clientSummary'  => $clientSummary,
            'workOrdersPath' => parse_url(route('dashboard.services.work-orders.index'), PHP_URL_PATH) ?: '/dashboard/services/work-orders',
            'can'            => [
                'export' => $canExport,
            ],
            'exportUrl'      => $exportUrl,
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filename = 'cuentas-por-cobrar-'.now('America/Lima')->format('Y-m-d-His').'.xlsx';

        return Excel::download(new AccountsReceivableExport($request), $filename, \Maatwebsite\Excel\Excel::XLSX);
    }
}
