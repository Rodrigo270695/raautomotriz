import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    FileSpreadsheet,
    FileText,
    LayoutGrid,
    ReceiptText,
    Users,
    Wallet,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, WorkOrder, PaginatedResponse } from '@/types';
import { DataTable } from '@/components/data-table';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import { SearchInput } from '@/components/search';
import { TablePagination } from '@/components/pagination/TablePagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { WORK_ORDER_STATUS_OPTIONS, getWorkOrderStatusLabel, formatCurrency } from '@/lib/workOrderUtils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Servicio', href: '#' },
    { title: 'Cuentas por cobrar', href: '/dashboard/services/accounts-receivable' },
];

const INDEX_PATH = '/dashboard/services/accounts-receivable';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos los estados' },
    ...WORK_ORDER_STATUS_OPTIONS.filter((s) => s.value !== 'cancelado'),
];

type WorkOrderWithPending = WorkOrder & { pending_amount?: number };

type ClientSummaryRow = {
    client_id: number;
    client_name: string;
    client_email: string | null;
    client_phone: string | null;
    orders_count: number;
    total_amount: number;
    total_paid: number;
    total_pending: number;
};

type AccountsReceivableIndexProps = {
    workOrders: PaginatedResponse<WorkOrderWithPending>;
    filters: {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        filter_status?: string;
        date_from?: string;
        date_to?: string;
    };
    stats: {
        total_orders: number;
        total_pending: number;
    };
    clientSummary: ClientSummaryRow[];
    workOrdersPath: string;
    can: { export?: boolean };
    exportUrl?: string | null;
};

function formatEntryDate(entryDate: string, entryTime?: string | null): string {
    if (!entryDate) return '—';
    const [y, m, d] = entryDate.slice(0, 10).split('-');
    if (!y || !m || !d) return entryDate;
    const base = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    if (!entryTime || entryTime.trim() === '') return base;
    return `${base} ${entryTime.slice(0, 5)}`;
}

function statusClass(status: string): string {
    const classes: Record<string, string> = {
        ingreso:             'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
        en_checklist:        'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
        diagnosticado:       'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
        en_reparacion:       'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
        listo_para_entregar: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
        entregado:           'bg-content-muted/60 text-muted-foreground',
    };
    return classes[status] ?? 'bg-content-muted/60 text-muted-foreground';
}

export default function AccountsReceivableIndex({
    workOrders,
    filters,
    stats,
    clientSummary,
    workOrdersPath,
    can,
    exportUrl,
}: AccountsReceivableIndexProps) {
    const [isNavigating, setIsNavigating] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'clients'>('orders');

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => { offStart(); offFinish(); };
    }, []);

    const sortBy  = filters.sort_by ?? 'entry_date';
    const sortDir = (filters.sort_dir ?? 'desc') as 'asc' | 'desc';

    const onSort = (key: string) => {
        const nextDir = sortBy === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        router.get(INDEX_PATH, { ...filters, sort_by: key, sort_dir: nextDir }, { preserveState: true });
    };
    const onFilterStatus = (value: string) => {
        router.get(INDEX_PATH, { ...filters, filter_status: value === 'all' ? undefined : value, page: undefined }, { preserveState: true });
    };
    const onDateRangeChange = (from: string, to: string) => {
        router.get(INDEX_PATH, { ...filters, date_from: from || undefined, date_to: to || undefined, page: undefined }, { preserveState: true });
    };
    const clearDateRange = () => {
        router.get(INDEX_PATH, { ...filters, date_from: undefined, date_to: undefined, page: undefined }, { preserveState: true });
    };

    const vehicleLabel = (r: WorkOrderWithPending) => {
        const v = r.vehicle;
        if (!v) return '—';
        const model = (v as { vehicle_model?: { name: string } }).vehicle_model;
        return model ? `${v.plate} — ${model.name}` : v.plate;
    };
    const clientLabel = (r: WorkOrderWithPending) => {
        const c = r.client;
        if (!c) return '—';
        return `${c.first_name} ${c.last_name}`.trim() || '—';
    };

    const columns = [
        {
            key: 'vehicle',
            label: 'Vehículo',
            render: (r: WorkOrderWithPending) => (
                <span className="text-foreground text-sm font-medium">{vehicleLabel(r)}</span>
            ),
        },
        {
            key: 'client',
            label: 'Cliente',
            render: (r: WorkOrderWithPending) => (
                <span className="text-muted-foreground text-sm">{clientLabel(r)}</span>
            ),
        },
        {
            key: 'entry_date',
            label: 'F. ingreso',
            sortKey: 'entry_date',
            render: (r: WorkOrderWithPending) => (
                <span className="text-muted-foreground text-sm tabular-nums">
                    {formatEntryDate(r.entry_date, r.entry_time)}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            sortKey: 'status',
            render: (r: WorkOrderWithPending) => (
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${statusClass(r.status)}`}>
                    {getWorkOrderStatusLabel(r.status)}
                </span>
            ),
        },
        {
            key: 'total_amount',
            label: 'Total',
            sortKey: 'total_amount',
            render: (r: WorkOrderWithPending) => (
                <span className="text-sm tabular-nums text-foreground">
                    {formatCurrency(Number(r.total_amount) || 0)}
                </span>
            ),
        },
        {
            key: 'total_paid',
            label: 'Pagado',
            render: (r: WorkOrderWithPending) => (
                <span className="text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(r.total_paid ?? 0)}
                </span>
            ),
        },
        {
            key: 'pending_amount',
            label: 'Pendiente',
            sortKey: 'pending_amount',
            render: (r: WorkOrderWithPending) => (
                <span className="text-sm tabular-nums font-semibold text-rose-600 dark:text-rose-400">
                    {formatCurrency(r.pending_amount ?? 0)}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[80px] text-right',
            render: (r: WorkOrderWithPending) => (
                <div className="flex items-center justify-end">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400/80 dark:hover:bg-rose-900/20 dark:hover:text-rose-300"
                                asChild
                            >
                                <Link href={`${workOrdersPath}/${r.id}/config`} aria-label="Ir a pagos">
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ir a servicios / pagos</TooltipContent>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-4">
            <AlertCircle className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay cuentas pendientes de cobro.</span>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cuentas por cobrar" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 relative">
                {isNavigating && (
                    <div
                        className="absolute top-0 left-0 right-0 h-0.5 bg-primary/80 animate-pulse z-10 rounded-b"
                        role="progressbar"
                        aria-label="Cargando"
                    />
                )}

                {/* Encabezado */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="relative inline-block font-semibold text-foreground text-xl tracking-tight pb-1">
                            Cuentas por cobrar
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-rose-500" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Órdenes de trabajo con saldo pendiente de pago.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {can.export && exportUrl && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="cursor-pointer shrink-0 border-[#217346]/40 bg-[#217346] text-white hover:bg-[#1a5c38] hover:text-white dark:border-[#217346]/60 dark:bg-[#217346] dark:hover:bg-[#1a5c38]"
                                        asChild
                                    >
                                        <a href={exportUrl} download target="_blank" rel="noopener noreferrer" aria-label="Descargar Excel">
                                            <FileSpreadsheet className="size-5" />
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Descargar Excel</TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>

                {/* Stats pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 dark:bg-rose-950/40">
                        <ReceiptText className="size-3.5 text-rose-600 dark:text-rose-400" />
                        <span className="text-muted-foreground">Órdenes</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{stats.total_orders}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <Users className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">Clientes</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">{clientSummary.length}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <Wallet className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Total pendiente</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {formatCurrency(stats.total_pending)}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {workOrders.current_page}
                            <span className="font-normal text-muted-foreground"> / {workOrders.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <LayoutGrid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {workOrders.data.length}
                        </span>
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 rounded-lg border border-content-border bg-content-muted/30 p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                            activeTab === 'orders'
                                ? 'bg-white text-foreground shadow-sm dark:bg-card'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <ReceiptText className="size-3.5" />
                            Por orden
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('clients')}
                        className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                            activeTab === 'clients'
                                ? 'bg-white text-foreground shadow-sm dark:bg-card'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Users className="size-3.5" />
                            Por cliente
                        </span>
                    </button>
                </div>

                <div className="border-t border-content-border pt-4" />

                {/* Tabla por cliente */}
                {activeTab === 'clients' && (
                    <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        {/* Filtro búsqueda */}
                        <div className="border-b border-content-border p-3 sm:p-4">
                            <SearchInput
                                queryKey="search"
                                defaultValue={filters.search ?? ''}
                                placeholder="Buscar por nombre de cliente…"
                                className="w-full sm:w-72"
                                inputClassName="focus-visible:border-primary/50 focus-visible:ring-primary/30"
                            />
                        </div>

                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            {clientSummary.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-10">
                                    <AlertCircle className="size-10 text-muted-foreground/60" />
                                    <span className="text-muted-foreground text-sm">No hay clientes con saldo pendiente.</span>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-content-border bg-content-muted/40">
                                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Cliente</th>
                                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Teléfono</th>
                                            <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Órdenes</th>
                                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total facturado</th>
                                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total pagado</th>
                                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total pendiente</th>
                                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-content-border">
                                        {clientSummary.map((c) => (
                                            <tr key={c.client_id} className="hover:bg-content-muted/20 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-foreground">{c.client_name}</div>
                                                    {c.client_email && (
                                                        <div className="text-xs text-muted-foreground">{c.client_email}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                                    {c.client_phone ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center justify-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                                                        {c.orders_count}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-foreground">
                                                    {formatCurrency(Number(c.total_amount))}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(Number(c.total_paid))}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums font-semibold text-rose-600 dark:text-rose-400">
                                                    {formatCurrency(Number(c.total_pending))}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="cursor-pointer shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400/80 dark:hover:bg-rose-900/20"
                                                                onClick={() => {
                                                                    setActiveTab('orders');
                                                                    router.get(INDEX_PATH, { ...filters, search: c.client_name }, { preserveState: true });
                                                                }}
                                                            >
                                                                <ArrowRight className="size-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Ver órdenes de este cliente</TooltipContent>
                                                    </Tooltip>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-content-border bg-content-muted/40 font-semibold">
                                            <td className="px-4 py-2.5 text-muted-foreground" colSpan={2}>Total general</td>
                                            <td className="px-4 py-2.5 text-center text-muted-foreground">
                                                {clientSummary.reduce((s, c) => s + c.orders_count, 0)}
                                            </td>
                                            <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                                                {formatCurrency(clientSummary.reduce((s, c) => s + Number(c.total_amount), 0))}
                                            </td>
                                            <td className="px-4 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(clientSummary.reduce((s, c) => s + Number(c.total_paid), 0))}
                                            </td>
                                            <td className="px-4 py-2.5 text-right tabular-nums text-rose-600 dark:text-rose-400">
                                                {formatCurrency(clientSummary.reduce((s, c) => s + Number(c.total_pending), 0))}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            )}
                        </div>

                        {/* Mobile */}
                        <div className="block md:hidden">
                            {clientSummary.length === 0 ? (
                                <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                    <AlertCircle className="size-10 text-muted-foreground/60" />
                                    <span className="text-muted-foreground text-sm">No hay clientes con saldo pendiente.</span>
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                    {clientSummary.map((c) => (
                                        <li key={c.client_id} className="rounded-lg border border-content-border bg-card p-3 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{c.client_name}</p>
                                                    {c.client_phone && (
                                                        <p className="text-xs text-muted-foreground">{c.client_phone}</p>
                                                    )}
                                                </div>
                                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 shrink-0">
                                                    {c.orders_count} orden{c.orders_count !== 1 ? 'es' : ''}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-muted-foreground">Facturado</span>
                                                    <span className="font-medium tabular-nums">{formatCurrency(Number(c.total_amount))}</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-muted-foreground">Pagado</span>
                                                    <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(c.total_paid))}</span>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-muted-foreground">Pendiente</span>
                                                    <span className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">{formatCurrency(Number(c.total_pending))}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="cursor-pointer w-full border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
                                                onClick={() => {
                                                    setActiveTab('orders');
                                                    router.get(INDEX_PATH, { ...filters, search: c.client_name }, { preserveState: true });
                                                }}
                                            >
                                                Ver órdenes
                                                <ArrowRight className="size-4 ml-1" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {/* Tabla por orden */}
                {activeTab === 'orders' && (
                <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                    {/* Filtros */}
                    <div className="border-b border-content-border p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <SearchInput
                                queryKey="search"
                                defaultValue={filters.search ?? ''}
                                placeholder="Buscar por placa o cliente…"
                                className="w-full sm:w-72"
                                inputClassName="focus-visible:border-primary/50 focus-visible:ring-primary/30"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                                    <Calendar className="size-4" />
                                    <span className="hidden sm:inline">Rango:</span>
                                </span>
                                <Input
                                    type="date"
                                    className="h-9 w-full border-content-border sm:w-40"
                                    value={filters.date_from ?? ''}
                                    onChange={(e) => onDateRangeChange(e.target.value, filters.date_to ?? '')}
                                    aria-label="Desde"
                                />
                                <span className="text-muted-foreground text-sm">—</span>
                                <Input
                                    type="date"
                                    className="h-9 w-full border-content-border sm:w-40"
                                    value={filters.date_to ?? ''}
                                    onChange={(e) => onDateRangeChange(filters.date_from ?? '', e.target.value)}
                                    aria-label="Hasta"
                                />
                                {(filters.date_from || filters.date_to) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="cursor-pointer h-9 text-muted-foreground hover:text-foreground"
                                        onClick={clearDateRange}
                                    >
                                        Limpiar fechas
                                    </Button>
                                )}
                            </div>
                            <Select
                                value={filters.filter_status ?? 'all'}
                                onValueChange={onFilterStatus}
                            >
                                <SelectTrigger className="w-full sm:w-52 border-content-border">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {filters.search != null && filters.search !== '' && (
                            <p className="mt-2 text-muted-foreground text-sm">
                                <span className="font-medium text-foreground">{workOrders.total}</span>{' '}
                                resultado{workOrders.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<WorkOrderWithPending>
                            columns={columns}
                            data={workOrders.data}
                            keyExtractor={(r) => r.id}
                            emptyMessage="No hay cuentas pendientes de cobro."
                            emptyContent={emptyContent}
                            embedded
                            striped
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                        />
                    </div>

                    {/* Mobile */}
                    <div className="block md:hidden">
                        {workOrders.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {workOrders.data.map((item) => (
                                    <li key={item.id}>
                                        <DataTableCard
                                            title={vehicleLabel(item)}
                                            actions={
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="cursor-pointer shrink-0 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                                    asChild
                                                >
                                                    <Link href={`${workOrdersPath}/${item.id}/config`}>
                                                        Ir a pagos
                                                        <ArrowRight className="size-4 ml-1" />
                                                    </Link>
                                                </Button>
                                            }
                                            fields={[
                                                { label: 'Cliente', value: clientLabel(item) },
                                                { label: 'F. ingreso', value: formatEntryDate(item.entry_date, item.entry_time) },
                                                { label: 'Estado', value: getWorkOrderStatusLabel(item.status) },
                                                { label: 'Total', value: formatCurrency(Number(item.total_amount) || 0) },
                                                { label: 'Pagado', value: formatCurrency(item.total_paid ?? 0) },
                                                { label: 'Pendiente', value: formatCurrency(item.pending_amount ?? 0) },
                                            ]}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Paginación */}
                    <div className="border-t border-content-border px-3 py-3 sm:px-4">
                        <TablePagination
                            from={workOrders.from}
                            to={workOrders.to}
                            total={workOrders.total}
                            perPage={workOrders.per_page}
                            currentPage={workOrders.current_page}
                            lastPage={workOrders.last_page}
                            links={workOrders.links}
                            indexPath={INDEX_PATH}
                            search={filters.search}
                            extraParams={{
                                sort_by: sortBy,
                                sort_dir: sortDir,
                                filter_status: filters.filter_status,
                                date_from: filters.date_from,
                                date_to: filters.date_to,
                            }}
                        />
                    </div>
                </div>
                )}
            </div>
        </AppLayout>
    );
}
