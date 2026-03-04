import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ClipboardList, Eye, FileDown, FileText, Inbox, LayoutGrid } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/data-table';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import { SearchInput } from '@/components/search';
import { TablePagination } from '@/components/pagination/TablePagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { getWorkOrderStatusLabel, formatCurrency } from '@/lib/workOrderUtils';
import { history as historyRoute, show as showRoute } from '@/routes/dashboard/my-orders';

interface WorkOrderRow {
    id: number;
    entry_date: string;
    entry_time: string | null;
    status: string;
    vehicle_plate: string | null;
    vehicle_display: string;
    total_amount: number | null;
    summary_pdf_url: string;
}

interface PageProps {
    workOrders: {
        data: WorkOrderRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    };
    breadcrumbs: BreadcrumbItem[];
}

function formatEntryDateTime(dateStr: string, timeStr: string | null): string {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const dateFormatted = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    if (!timeStr || timeStr.trim() === '') return dateFormatted;
    const timePart = String(timeStr).slice(0, 5);
    return `${dateFormatted} ${timePart}`;
}

function vehicleColumn(row: WorkOrderRow): string {
    const plate = row.vehicle_plate ?? '';
    const model = row.vehicle_display?.trim() ?? '';
    if (!plate && !model) return '—';
    if (!model) return plate;
    return `${plate} — ${model}`;
}

function statusClass(status: string): string {
    return 'bg-content-muted/60 text-muted-foreground';
}

export default function MyOrdersHistory({ workOrders, filters, breadcrumbs }: PageProps) {
    const indexPath = historyRoute.url();

    const onDateRangeChange = (from: string, to: string) => {
        router.get(indexPath, {
            ...filters,
            search: filters.search ?? undefined,
            date_from: from || undefined,
            date_to: to || undefined,
            page: undefined,
        }, { preserveState: true });
    };
    const clearDateRange = () => {
        router.get(indexPath, {
            ...filters,
            search: filters.search ?? undefined,
            date_from: undefined,
            date_to: undefined,
            page: undefined,
        }, { preserveState: true });
    };

    const columns = [
        {
            key: 'vehicle',
            label: 'Vehículo',
            render: (row: WorkOrderRow) => (
                <span className="text-foreground text-sm">{vehicleColumn(row)}</span>
            ),
        },
        {
            key: 'entry_date',
            label: 'F. ingreso',
            render: (row: WorkOrderRow) => (
                <span className="text-muted-foreground text-sm tabular-nums">
                    {formatEntryDateTime(row.entry_date, row.entry_time)}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (row: WorkOrderRow) => (
                <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${statusClass(row.status)}`}
                >
                    {getWorkOrderStatusLabel(row.status)}
                </span>
            ),
        },
        {
            key: 'total_amount',
            label: 'Total',
            render: (row: WorkOrderRow) => (
                <span className="text-foreground text-sm tabular-nums font-medium">
                    {row.total_amount != null ? formatCurrency(row.total_amount) : '—'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[120px] text-right',
            render: (row: WorkOrderRow) => (
                <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer shrink-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                                asChild
                            >
                                <Link href={showRoute.url(row.id)} aria-label="Ver línea de tiempo de la orden">
                                    <Eye className="size-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver línea de tiempo</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer shrink-0 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                                asChild
                            >
                                <a href={row.summary_pdf_url} target="_blank" rel="noopener noreferrer" aria-label="Descargar PDF resumen">
                                    <FileDown className="size-4" />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Descargar PDF resumen</TooltipContent>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay órdenes en tu historial con los filtros aplicados.</span>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Historial" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="relative inline-block font-semibold text-foreground text-xl tracking-tight pb-1">
                            Mi Historial
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Historial de órdenes ya entregadas. Filtra por fechas o busca por placa o modelo.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <ClipboardList className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Órdenes</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {workOrders.total}
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
                            {workOrders.data?.length ?? 0}
                        </span>
                    </span>
                </div>

                <div className="border-t border-content-border pt-4" />

                <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                    <div className="border-b border-content-border p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <SearchInput
                                name="search"
                                queryKey="search"
                                defaultValue={filters.search ?? ''}
                                placeholder="Buscar por placa o modelo…"
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
                        </div>
                        {filters.search != null && filters.search !== '' && (
                            <p className="mt-2 text-muted-foreground text-sm">
                                <span className="font-medium text-foreground">{workOrders.total}</span>{' '}
                                resultado{workOrders.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<WorkOrderRow>
                            columns={columns}
                            data={workOrders.data ?? []}
                            keyExtractor={(r) => r.id}
                            emptyMessage="No hay órdenes en tu historial."
                            emptyContent={emptyContent}
                            embedded
                            striped
                        />
                    </div>

                    <div className="block md:hidden">
                        {!workOrders.data || workOrders.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {workOrders.data.map((item) => (
                                    <li key={item.id}>
                                        <DataTableCard
                                            title={vehicleColumn(item)}
                                            actions={
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="cursor-pointer shrink-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30"
                                                        asChild
                                                    >
                                                        <Link href={showRoute.url(item.id)}>
                                                            <Eye className="size-4 mr-1" />
                                                            Ver
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="cursor-pointer shrink-0 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                                        asChild
                                                    >
                                                        <a href={item.summary_pdf_url} target="_blank" rel="noopener noreferrer">
                                                            <FileDown className="size-4 mr-1" />
                                                            PDF
                                                        </a>
                                                    </Button>
                                                </div>
                                            }
                                            fields={[
                                                { label: 'F. ingreso', value: formatEntryDateTime(item.entry_date, item.entry_time) },
                                                { label: 'Estado', value: getWorkOrderStatusLabel(item.status) },
                                                {
                                                    label: 'Total',
                                                    value: item.total_amount != null ? formatCurrency(item.total_amount) : '—',
                                                },
                                            ]}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="border-t border-content-border px-3 py-3 sm:px-4">
                        <TablePagination
                            from={workOrders.from}
                            to={workOrders.to}
                            total={workOrders.total}
                            perPage={workOrders.per_page}
                            currentPage={workOrders.current_page}
                            lastPage={workOrders.last_page}
                            links={workOrders.links}
                            indexPath={indexPath}
                            search={filters.search ?? undefined}
                            extraParams={{
                                date_from: filters.date_from ?? undefined,
                                date_to: filters.date_to ?? undefined,
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
