import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Calendar, FileText, LayoutGrid, Plus, Inbox, Wrench, ClipboardList, Settings } from 'lucide-react';
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

const getBreadcrumbs = (workOrdersPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Servicio', href: '#' },
    { title: 'Órdenes de trabajo', href: workOrdersPath },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'ingreso', label: 'Ingreso' },
    { value: 'en_checklist', label: 'En checklist' },
    { value: 'diagnosticado', label: 'Diagnosticado' },
    { value: 'en_reparacion', label: 'En reparación' },
    { value: 'listo_para_entregar', label: 'Listo para entregar' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' },
];

function statusLabel(status: string): string {
    const o = STATUS_OPTIONS.find((s) => s.value === status);
    return o?.label ?? status;
}

function statusClass(status: string): string {
    if (status === 'entregado' || status === 'cancelado') {
        return 'bg-content-muted/60 text-muted-foreground';
    }
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
}

function formatCurrency(value: number | string): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(n)) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
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
    vehicles: Array<{ id: number; plate: string; vehicle_model_id: number | null; vehicle_model?: { id: number; name: string } }>;
    clients: Array<{ id: number; first_name: string; last_name: string }>;
    can: { create: boolean; update: boolean; delete: boolean; view_photos?: boolean };
};

export default function WorkOrdersIndex({
    workOrders,
    filters,
    workOrdersIndexPath,
    stats,
    vehicles,
    clients,
    can,
}: WorkOrdersIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
    const [deleteWorkOrder, setDeleteWorkOrder] = useState<WorkOrder | null>(null);
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
                            S/ {formatCurrency(paid)}
                        </span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="font-medium">S/ {formatCurrency(total)}</span>
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
                    <div className="flex shrink-0 items-center gap-2">
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
                                                <div className="flex items-center justify-end gap-2">
                                                    {(item.can_edit ?? false) && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="cursor-pointer shrink-0 text-violet-500 hover:bg-violet-50 hover:text-violet-600 dark:text-violet-400/80 dark:hover:bg-violet-900/20 dark:hover:text-violet-300"
                                                                    asChild
                                                                >
                                                                    <Link href={`${workOrdersIndexPath}/${item.id}/config`} aria-label="Configuración">
                                                                        <Settings className="size-4" />
                                                                    </Link>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Configuración</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    <ActionButtons
                                                        canEdit={item.can_edit ?? false}
                                                        canDelete={item.can_delete ?? false}
                                                        onEdit={() => openEdit(item)}
                                                        onDelete={() => setDeleteWorkOrder(item)}
                                                        deleteUrl={item.can_delete ? `${workOrdersIndexPath}/${item.id}` : undefined}
                                                    />
                                                </div>
                                            }
                                            fields={[
                                                { label: 'Cliente', value: clientLabel(item) },
                                                { label: 'F. ingreso', value: formatEntryDateTime(item.entry_date, item.entry_time) },
                                                { label: 'Estado', value: statusLabel(item.status) },
                                                {
                                                label: 'Total',
                                                value:
                                                    (item.total_paid ?? 0) > 0
                                                        ? `S/ ${formatCurrency(item.total_paid ?? 0)} abonado / S/ ${formatCurrency(item.total_amount)} total`
                                                        : `S/ ${formatCurrency(item.total_amount)}`,
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
                vehicles={vehicles}
                clients={clients}
            />
            <DeleteWorkOrderDialog
                open={!!deleteWorkOrder}
                onOpenChange={(open) => !open && setDeleteWorkOrder(null)}
                workOrder={deleteWorkOrder}
                workOrdersIndexPath={workOrdersIndexPath}
            />
        </AppLayout>
    );
}
