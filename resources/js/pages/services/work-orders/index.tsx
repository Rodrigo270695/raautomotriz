import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Eye, FileSpreadsheet, FileText, Gauge, LayoutGrid, Plus, Inbox, Wrench, ClipboardList, Settings, FileDown } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, WorkOrder, PaginatedResponse } from '@/types';
import { DataTable } from '@/components/data-table';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import { ActionButtons } from '@/components/actions';
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
import { WorkOrderFormModal } from '@/components/WorkOrderFormModal';
import { DeleteWorkOrderDialog } from '@/components/DeleteWorkOrderDialog';
import { WORK_ORDER_STATUS_OPTIONS, getWorkOrderStatusLabel, formatCurrency } from '@/lib/workOrderUtils';

const getBreadcrumbs = (workOrdersPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Servicio', href: '#' },
    { title: 'Órdenes de trabajo', href: workOrdersPath },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos' },
    ...WORK_ORDER_STATUS_OPTIONS,
];

function statusLabel(status: string): string {
    return getWorkOrderStatusLabel(status);
}

function statusClass(status: string): string {
    if (status === 'entregado' || status === 'cancelado') {
        return 'bg-content-muted/60 text-muted-foreground';
    }
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
}

/** Formatea fecha y hora a dd/mm/yyyy hh:mm */
function formatEntryDateTime(entryDate: string, entryTime?: string | null): string {
    if (!entryDate) return '—';
    const dateStr = entryDate.slice(0, 10);
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return entryDate;
    const dateFormatted = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    if (!entryTime || entryTime.trim() === '') return dateFormatted;
    const timePart = entryTime.slice(0, 5);
    const match = timePart.match(/^\d{1,2}:\d{2}$/);
    const timeFormatted = match ? timePart : entryTime.slice(0, 5);
    return `${dateFormatted} ${timeFormatted}`;
}

type WorkOrdersIndexProps = {
    workOrders: PaginatedResponse<WorkOrder>;
    filters: {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        filter_status?: string;
        date_from?: string;
        date_to?: string;
    };
    workOrdersIndexPath: string;
    stats: {
        total_work_orders: number;
        total_ingreso: number;
    };
    can: { create: boolean; update: boolean; delete: boolean; view_photos?: boolean; export?: boolean; view_summary?: boolean; print_summary?: boolean };
    exportUrl?: string | null;
};

export default function WorkOrdersIndex({
    workOrders,
    filters,
    workOrdersIndexPath,
    stats,
    can,
    exportUrl,
}: WorkOrdersIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
    const [deleteWorkOrder, setDeleteWorkOrder] = useState<WorkOrder | null>(null);
    const [deliverOrder, setDeliverOrder] = useState<WorkOrder | null>(null);
    const [delivering, setDelivering] = useState(false);
    const [exitMileage, setExitMileage] = useState<string>('');
    const [nextDueDays, setNextDueDays] = useState<string>('');
    const [isNavigating, setIsNavigating] = useState(false);
    const indexPath = workOrdersIndexPath;

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const openCreate = () => {
        setEditingWorkOrder(null);
        setFormOpen(true);
    };
    const openEdit = (item: WorkOrder) => {
        setEditingWorkOrder(item);
        setFormOpen(true);
    };
    const closeForm = (open: boolean) => {
        if (!open) setEditingWorkOrder(null);
        setFormOpen(open);
    };

    const openDeliverDialog = (order: WorkOrder) => {
        setExitMileage(order.exit_mileage ? String(order.exit_mileage) : '');
        // Pre-llenar con los días mínimos del paquete de servicio
        setNextDueDays(order.min_interval_days ? String(order.min_interval_days) : '');
        setDeliverOrder(order);
    };

    const closeDeliverDialog = () => {
        setDeliverOrder(null);
        setExitMileage('');
        setNextDueDays('');
    };

    const estimatedNextDate = (() => {
        const days = parseInt(nextDueDays, 10);
        if (!days || days <= 0) return null;
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    })();

    const handleMarkDelivered = () => {
        if (!deliverOrder?.mark_deliver_path) return;
        setDelivering(true);
        router.post(deliverOrder.mark_deliver_path, {
            exit_mileage: exitMileage !== '' ? exitMileage : null,
            next_due_days: nextDueDays !== '' ? nextDueDays : null,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setDelivering(false);
                closeDeliverDialog();
            },
        });
    };

    const sortBy = filters.sort_by ?? 'entry_date';
    const sortDir = (filters.sort_dir ?? 'desc') as 'asc' | 'desc';
    const onSort = (key: string) => {
        const nextDir = sortBy === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        router.get(indexPath, { ...filters, sort_by: key, sort_dir: nextDir }, { preserveState: true });
    };
    const onFilterStatus = (value: string) => {
        router.get(indexPath, { ...filters, filter_status: value === 'all' ? undefined : value, page: undefined }, { preserveState: true });
    };
    const onDateRangeChange = (from: string, to: string) => {
        router.get(indexPath, {
            ...filters,
            date_from: from || undefined,
            date_to: to || undefined,
            page: undefined,
        }, { preserveState: true });
    };
    const clearDateRange = () => {
        router.get(indexPath, { ...filters, date_from: undefined, date_to: undefined, page: undefined }, { preserveState: true });
    };

    const vehicleLabel = (r: WorkOrder) => {
        const v = r.vehicle;
        if (!v) return '—';
        const model = (v as { vehicle_model?: { name: string } }).vehicle_model;
        return model ? `${v.plate} — ${model.name}` : v.plate;
    };
    const clientLabel = (r: WorkOrder) => {
        const c = r.client;
        if (!c) return '—';
        return `${c.first_name} ${c.last_name}`.trim() || '—';
    };

    const columns = [
        {
            key: 'vehicle',
            label: 'Vehículo',
            render: (r: WorkOrder) => (
                <span className="text-foreground text-sm">{vehicleLabel(r)}</span>
            ),
        },
        {
            key: 'client',
            label: 'Cliente',
            render: (r: WorkOrder) => (
                <span className="text-muted-foreground text-sm">{clientLabel(r)}</span>
            ),
        },
        {
            key: 'entry_date',
            label: 'F. ingreso',
            sortKey: 'entry_date',
            render: (r: WorkOrder) => (
                <span className="text-muted-foreground text-sm tabular-nums">
                    {formatEntryDateTime(r.entry_date, r.entry_time)}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            sortKey: 'status',
            render: (r: WorkOrder) => (
                <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${statusClass(r.status)}`}
                >
                    {statusLabel(r.status)}
                </span>
            ),
        },
        {
            key: 'total_amount',
            label: 'Total',
            sortKey: 'total_amount',
            render: (r: WorkOrder) => {
                const total = Number(r.total_amount) || 0;
                const paid = r.total_paid ?? 0;
                return (
                    <span className="text-foreground text-sm tabular-nums">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(paid)}
                        </span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="font-medium">{formatCurrency(total)}</span>
                    </span>
                );
            },
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[120px] text-right',
            render: (r: WorkOrder) => (
                <div className="flex items-center justify-end gap-2">
                    {/* Listo para entregar: botón de entrega */}
                    {(r.can_mark_delivered ?? false) && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="cursor-pointer shrink-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                    onClick={() => openDeliverDialog(r)}
                                >
                                    <CheckCircle2 className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Marcar como entregado</TooltipContent>
                        </Tooltip>
                    )}
                    {/* Orden entregada: botones de resumen y PDF */}
                    {r.status === 'entregado' ? (
                        <div className="flex items-center gap-1">
                            {(r.can_view_summary ?? false) && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer shrink-0 text-sky-500 hover:bg-sky-50 hover:text-sky-600 dark:text-sky-400/80 dark:hover:bg-sky-900/20 dark:hover:text-sky-300"
                                            asChild
                                        >
                                            <Link href={`${workOrdersIndexPath}/${r.id}`} aria-label="Ver resumen">
                                                <Eye className="size-4" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Ver resumen</TooltipContent>
                                </Tooltip>
                            )}
                            {(r.can_print_summary ?? false) && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer shrink-0 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                                            asChild
                                        >
                                            <a href={`${workOrdersIndexPath}/${r.id}/summary/pdf`} target="_blank" rel="noopener noreferrer" aria-label="Descargar PDF resumen">
                                                <FileDown className="size-4" />
                                            </a>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Descargar PDF resumen</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    ) : (
                        <>
                            {(r.can_edit ?? false) && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="cursor-pointer shrink-0 text-violet-500 hover:bg-violet-50 hover:text-violet-600 dark:text-violet-400/80 dark:hover:bg-violet-900/20 dark:hover:text-violet-300"
                                            asChild
                                        >
                                            <Link href={`${workOrdersIndexPath}/${r.id}/config`} aria-label="Configuración">
                                                <Settings className="size-4" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Configuración</TooltipContent>
                                </Tooltip>
                            )}
                            <ActionButtons
                                canEdit={r.can_edit ?? false}
                                canDelete={r.can_delete ?? false}
                                onEdit={() => openEdit(r)}
                                onDelete={() => setDeleteWorkOrder(r)}
                                deleteUrl={r.can_delete ? `${workOrdersIndexPath}/${r.id}` : undefined}
                            />
                        </>
                    )}
                </div>
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay órdenes de trabajo.</span>
            {can.create && (
                <Button size="sm" onClick={openCreate} className="cursor-pointer mt-1">
                    <Plus className="size-4 mr-1" />
                    Crear primera orden
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(workOrdersIndexPath)}>
            <Head title="Órdenes de trabajo" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 relative">
                {isNavigating && (
                    <div
                        className="absolute top-0 left-0 right-0 h-0.5 bg-primary/80 animate-pulse z-10 rounded-b"
                        role="progressbar"
                        aria-label="Cargando"
                    />
                )}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="relative inline-block font-semibold text-foreground text-xl tracking-tight pb-1">
                            Órdenes de trabajo
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de órdenes de trabajo (ingreso, diagnóstico, reparación y entrega).
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
                        {can.create && (
                            <Button
                                onClick={openCreate}
                                className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                            >
                                <Plus className="size-4" />
                                Nueva orden
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <ClipboardList className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Órdenes</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.total_work_orders}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <Wrench className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">En ingreso</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {stats.total_ingreso}
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

                <div className="border-t border-content-border pt-4" />

                <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
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
                                <SelectTrigger className="w-full sm:w-44 border-content-border">
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

                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<WorkOrder>
                            columns={columns}
                            data={workOrders.data}
                            keyExtractor={(r) => r.id}
                            emptyMessage="No hay órdenes de trabajo. Cree una para comenzar."
                            emptyContent={emptyContent}
                            embedded
                            striped
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                        />
                    </div>

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
                                                item.status === 'entregado' ? (
                                                    <div className="flex items-center gap-2 justify-end flex-wrap">
                                                        {(item.can_view_summary ?? false) && (
                                                            <Button variant="outline" size="sm" className="cursor-pointer shrink-0 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-950/40" asChild>
                                                                <Link href={`${workOrdersIndexPath}/${item.id}`}>
                                                                    <Eye className="size-4 mr-1" />
                                                                    Ver resumen
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {(item.can_print_summary ?? false) && (
                                                            <Button variant="outline" size="sm" className="cursor-pointer shrink-0 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30" asChild>
                                                                <a href={`${workOrdersIndexPath}/${item.id}/summary/pdf`} target="_blank" rel="noopener noreferrer">
                                                                    <FileDown className="size-4 mr-1" />
                                                                    PDF
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                                        {(item.can_mark_delivered ?? false) && (
                                                            <Button variant="outline" size="sm" className="cursor-pointer shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40" onClick={() => openDeliverDialog(item)}>
                                                                <CheckCircle2 className="size-3.5 mr-1" />
                                                                Entregar
                                                            </Button>
                                                        )}
                                                        {(item.can_edit ?? false) && (
                                                            <Button variant="outline" size="sm" className="cursor-pointer shrink-0 border-violet-200 text-violet-600 hover:bg-violet-50 hover:text-violet-700 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-950/40" asChild>
                                                                <Link href={`${workOrdersIndexPath}/${item.id}/config`}>
                                                                    <Settings className="size-3.5 mr-1" />
                                                                    Configurar
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {(item.can_edit ?? false) && (
                                                            <Button variant="outline" size="sm" className="cursor-pointer shrink-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/40" onClick={() => openEdit(item)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                                                Editar
                                                            </Button>
                                                        )}
                                                        {(item.can_delete ?? false) && (
                                                            <Button variant="outline" size="sm" className="cursor-pointer shrink-0 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40" onClick={() => setDeleteWorkOrder(item)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                                                Eliminar
                                                            </Button>
                                                        )}
                                                    </div>
                                                )
                                            }
                                            fields={[
                                                { label: 'Cliente', value: clientLabel(item) },
                                                { label: 'F. ingreso', value: formatEntryDateTime(item.entry_date, item.entry_time) },
                                                { label: 'Estado', value: statusLabel(item.status) },
                                                {
                                                label: 'Total',
                                                value:
                                                    (item.total_paid ?? 0) > 0
                                                        ? `${formatCurrency(item.total_paid ?? 0)} abonado / ${formatCurrency(item.total_amount)} total`
                                                        : formatCurrency(item.total_amount),
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
                            indexPath={workOrdersIndexPath}
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
            </div>

            <WorkOrderFormModal
                open={formOpen}
                onOpenChange={closeForm}
                workOrder={editingWorkOrder}
                workOrdersIndexPath={workOrdersIndexPath}
                initialClient={editingWorkOrder?.client ? {
                    id: (editingWorkOrder.client as { id: number; first_name: string; last_name: string; document_number?: string | null }).id,
                    first_name: (editingWorkOrder.client as { first_name: string }).first_name,
                    last_name: (editingWorkOrder.client as { last_name: string }).last_name,
                    document_number: (editingWorkOrder.client as { document_number?: string | null }).document_number,
                } : null}
                initialVehicle={editingWorkOrder?.vehicle ? {
                    id: (editingWorkOrder.vehicle as { id: number }).id,
                    plate: (editingWorkOrder.vehicle as { plate: string }).plate,
                    vehicle_model_id: (editingWorkOrder.vehicle as { vehicle_model_id: number | null }).vehicle_model_id,
                    client_id: editingWorkOrder.client_id ?? 0,
                    vehicle_model: (editingWorkOrder.vehicle as { vehicle_model?: { id: number; name: string } | null }).vehicle_model ?? null,
                } : null}
            />
            <DeleteWorkOrderDialog
                open={!!deleteWorkOrder}
                onOpenChange={(open) => !open && setDeleteWorkOrder(null)}
                workOrder={deleteWorkOrder}
                workOrdersIndexPath={workOrdersIndexPath}
            />

            {/* Dialog: confirmar entrega */}
            <Dialog open={!!deliverOrder} onOpenChange={(open) => !open && closeDeliverDialog()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-emerald-500" />
                            Confirmar entrega
                        </DialogTitle>
                        <DialogDescription>
                            Registra los datos de salida del vehículo para programar el próximo mantenimiento.
                        </DialogDescription>
                    </DialogHeader>

                    {deliverOrder && (
                        <div className="flex flex-col gap-4">
                            {/* Datos de la orden */}
                            <div className="rounded-lg border border-content-border bg-content-muted/30 p-3 text-sm space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Vehículo</span>
                                    <span className="font-medium text-foreground">{vehicleLabel(deliverOrder)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cliente</span>
                                    <span className="text-foreground">{clientLabel(deliverOrder)}</span>
                                </div>
                                {(deliverOrder.entry_mileage ?? 0) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Km de ingreso</span>
                                        <span className="text-foreground tabular-nums">{Number(deliverOrder.entry_mileage).toLocaleString()} km</span>
                                    </div>
                                )}
                            </div>

                            {/* Campos de datos de salida */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                        <Gauge className="size-4 text-muted-foreground" />
                                        Km de salida
                                        <span className="text-xs font-normal text-muted-foreground">(opc.)</span>
                                    </label>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={1}
                                        placeholder="Ej. 85000"
                                        value={exitMileage}
                                        onChange={(e) => setExitMileage(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                        <Calendar className="size-4 text-muted-foreground" />
                                        Próximo en días
                                        <span className="text-xs font-normal text-muted-foreground">(opc.)</span>
                                    </label>
                                    <Input
                                        type="number"
                                        min={1}
                                        step={1}
                                        placeholder="Ej. 90"
                                        value={nextDueDays}
                                        onChange={(e) => setNextDueDays(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                            </div>
                            {estimatedNextDate && (
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-md px-3 py-2">
                                    Próximo mantenimiento estimado: <strong>{estimatedNextDate}</strong>
                                </p>
                            )}
                            {deliverOrder?.min_interval_km && (
                                <p className="text-xs text-muted-foreground">
                                    Intervalo de km del paquete: <strong>{Number(deliverOrder.min_interval_km).toLocaleString()} km</strong>
                                    {' '}— se calculará al ingresar el km de salida.
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button
                            variant="outline"
                            className="cursor-pointer w-full sm:w-auto"
                            onClick={closeDeliverDialog}
                            disabled={delivering}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="cursor-pointer w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleMarkDelivered}
                            disabled={delivering}
                        >
                            {delivering ? 'Procesando...' : 'Confirmar entrega'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
