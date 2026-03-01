import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { Car, FileSpreadsheet, FileText, LayoutGrid, Plus, UserX, Inbox, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Vehicle, PaginatedResponse } from '@/types';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { VehicleFormModal } from '@/components/VehicleFormModal';
import { DeleteVehicleDialog } from '@/components/DeleteVehicleDialog';

const getBreadcrumbs = (vehiclesPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Vehículo', href: vehiclesPath },
];

type BrandOption = { id: number; name: string };
type VehicleModelOption = { id: number; name: string; brand_id: number; brand_name: string };
type ClientOption = { id: number; name: string; first_name?: string; last_name?: string; document_number?: string };

type VehiclesIndexProps = {
    vehicles: PaginatedResponse<Vehicle>;
    filters: {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        filter_status?: string;
        filter_brand_id?: string;
        filter_model_id?: string;
        filter_client_id?: string;
    };
    vehiclesIndexPath: string;
    brandsForSelect: BrandOption[];
    vehicleModelsForSelect: VehicleModelOption[];
    clientsForSelect: ClientOption[];
    stats: {
        total_vehicles: number;
        active_vehicles: number;
        last_updated?: string | null;
    };
    can: { create: boolean; update: boolean; delete: boolean; export: boolean; view_audit: boolean };
    exportUrl: string;
};

function modelDisplay(v: Vehicle): string {
    const brand = v.vehicle_model?.brand?.name;
    const model = v.vehicle_model?.name;
    if (brand && model) return `${brand} – ${model}`;
    return model ?? '—';
}

export default function VehiclesIndex({
    vehicles,
    filters,
    vehiclesIndexPath,
    brandsForSelect,
    vehicleModelsForSelect,
    clientsForSelect,
    stats,
    can,
    exportUrl,
}: VehiclesIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const indexPath = vehiclesIndexPath;

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const refreshSelectData = () => {
        router.reload({
            only: ['brandsForSelect', 'vehicleModelsForSelect', 'clientsForSelect'],
            preserveState: true,
        });
    };

    const openCreate = () => {
        setEditingVehicle(null);
        setFormOpen(true);
        refreshSelectData();
    };
    const openEdit = (v: Vehicle) => {
        setEditingVehicle(v);
        setFormOpen(true);
        refreshSelectData();
    };
    const closeForm = (open: boolean) => {
        if (!open) setEditingVehicle(null);
        setFormOpen(open);
    };

    const sortBy = filters.sort_by ?? 'plate';
    const sortDir = (filters.sort_dir ?? 'asc') as 'asc' | 'desc';
    const onSort = (key: string) => {
        const nextDir = sortBy === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        router.get(indexPath, { ...filters, sort_by: key, sort_dir: nextDir }, { preserveState: true });
    };
    const onFilterStatus = (value: string) => {
        router.get(indexPath, { ...filters, filter_status: value === 'all' ? undefined : value, page: undefined }, { preserveState: true });
    };

    const filterBrandId = filters.filter_brand_id ?? '';
    const filterModelId = filters.filter_model_id ?? '';
    const modelsForBrandFilter = useMemo(() => {
        if (!filterBrandId) return [];
        const bid = Number(filterBrandId);
        return vehicleModelsForSelect.filter((m) => m.brand_id === bid);
    }, [filterBrandId, vehicleModelsForSelect]);

    const onFilterBrand = (value: string) => {
        router.get(indexPath, {
            ...filters,
            filter_brand_id: value || undefined,
            filter_model_id: undefined,
            page: undefined,
        }, { preserveState: true });
    };
    const onFilterModel = (value: string) => {
        router.get(indexPath, { ...filters, filter_model_id: value || undefined, page: undefined }, { preserveState: true });
    };

    const filterClientId = filters.filter_client_id ?? '';
    const filterClientName = filterClientId
        ? (clientsForSelect.find((c) => String(c.id) === filterClientId)?.name ?? null)
        : null;
    const clearClientFilter = () => {
        const { filter_client_id: _, ...rest } = filters;
        router.get(indexPath, { ...rest, page: undefined }, { preserveState: false });
    };

    const columns = [
        {
            key: 'plate',
            label: 'Placa',
            sortKey: 'plate',
            render: (v: Vehicle) => (
                <span className="font-medium text-foreground">{v.plate}</span>
            ),
        },
        {
            key: 'year',
            label: 'Año',
            sortKey: 'year',
            render: (v: Vehicle) => (
                <span className="text-muted-foreground text-sm">{v.year ?? '—'}</span>
            ),
        },
        {
            key: 'color',
            label: 'Color',
            sortKey: 'color',
            render: (v: Vehicle) => (
                <span className="text-muted-foreground text-sm">{v.color ?? '—'}</span>
            ),
        },
        {
            key: 'model',
            label: 'Modelo',
            render: (v: Vehicle) => (
                <span className="text-muted-foreground text-sm">{modelDisplay(v)}</span>
            ),
        },
        {
            key: 'client',
            label: 'Cliente',
            render: (v: Vehicle) => (
                <span className="text-muted-foreground text-sm">{v.client?.name ?? '—'}</span>
            ),
        },
        {
            key: 'mileage',
            label: 'Km ent./sal.',
            render: (v: Vehicle) => (
                <span className="text-muted-foreground text-sm">
                    {v.entry_mileage ?? '—'} / {v.exit_mileage ?? '—'}
                </span>
            ),
        },
        ...(can.view_audit
            ? [{
                key: 'audit',
                label: 'Creado / Modificado',
                render: (v: Vehicle) => (
                    <span className="flex flex-col gap-0 leading-tight text-muted-foreground text-xs">
                        <span title="Creado por">{v.created_by_name ?? '—'}</span>
                        <span title="Modificado por" className="text-muted-foreground/80">{v.updated_by_name ?? '—'}</span>
                    </span>
                ),
            }]
            : []),
        {
            key: 'status',
            label: 'Estado',
            sortKey: 'status',
            render: (v: Vehicle) => (
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-content-muted/60 text-muted-foreground'
                    }`}
                >
                    {v.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[100px] text-right',
            render: (v: Vehicle) => (
                <ActionButtons
                    canEdit={can.update}
                    canDelete={can.delete}
                    canAssignPermissions={false}
                    onEdit={() => openEdit(v)}
                    onDelete={() => setDeleteVehicle(v)}
                    deleteUrl={can.delete ? `${vehiclesIndexPath}/${v.id}` : undefined}
                />
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay vehículos.</span>
            {can.create && (
                <Button size="sm" onClick={openCreate} className="cursor-pointer mt-1">
                    <Plus className="size-4 mr-1" />
                    Registrar primer vehículo
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(vehiclesIndexPath)}>
            <Head title="Vehículo" />

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
                            Vehículo
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de vehículos por placa, modelo y cliente.
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
                                Nuevo vehículo
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Car className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Vehículos</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.total_vehicles}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <Car className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Activos</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {stats.active_vehicles}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {vehicles.current_page}
                            <span className="font-normal text-muted-foreground"> / {vehicles.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <LayoutGrid className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {vehicles.data.length}
                        </span>
                    </span>
                    {stats.total_vehicles - stats.active_vehicles > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-content-muted/50 px-2.5 py-1">
                            <UserX className="size-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Inactivos</span>
                            <span className="font-semibold text-muted-foreground">
                                {stats.total_vehicles - stats.active_vehicles}
                            </span>
                        </span>
                    )}
                </div>

                <div className="border-t border-content-border pt-4" />

                <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                    <div className="border-b border-content-border p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <SearchInput
                                queryKey="search"
                                defaultValue={filters.search ?? ''}
                                placeholder="Buscar por placa, color, marca, modelo o cliente…"
                                className="w-full sm:w-72"
                                inputClassName="focus-visible:border-primary/50 focus-visible:ring-primary/30"
                            />
                            <Select value={filterBrandId || 'all'} onValueChange={(v) => onFilterBrand(v === 'all' ? '' : v)}>
                                <SelectTrigger className="w-full sm:w-40 border-content-border">
                                    <SelectValue placeholder="Marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las marcas</SelectItem>
                                    {brandsForSelect.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filterModelId || 'all'}
                                onValueChange={(v) => onFilterModel(v === 'all' ? '' : v)}
                                disabled={!filterBrandId}
                            >
                                <SelectTrigger className="w-full sm:w-44 border-content-border">
                                    <SelectValue placeholder={filterBrandId ? 'Modelo' : 'Elija marca'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los modelos</SelectItem>
                                    {modelsForBrandFilter.map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.filter_status ?? 'all'}
                                onValueChange={onFilterStatus}
                            >
                                <SelectTrigger className="w-full sm:w-44 border-content-border">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="active">Activos</SelectItem>
                                    <SelectItem value="inactive">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {filterClientName != null && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-sm text-sky-800 dark:bg-sky-950/50 dark:text-sky-200 border border-sky-200/80 dark:border-sky-800/50">
                                    <span className="font-medium">Cliente:</span>
                                    <span>{filterClientName}</span>
                                    <button
                                        type="button"
                                        onClick={clearClientFilter}
                                        className="cursor-pointer ml-0.5 rounded-full p-0.5 hover:bg-sky-200/70 dark:hover:bg-sky-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                        aria-label="Quitar filtro de cliente"
                                        title="Ver todos los vehículos"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </span>
                            </div>
                        )}
                        {filters.search != null && filters.search !== '' && (
                            <p className="mt-2 text-muted-foreground text-sm">
                                <span className="font-medium text-foreground">{vehicles.total}</span>{' '}
                                resultado{vehicles.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<Vehicle>
                            columns={columns}
                            data={vehicles.data}
                            keyExtractor={(v) => v.id}
                            emptyMessage="No hay vehículos. Registre uno para comenzar."
                            emptyContent={emptyContent}
                            embedded
                            striped
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                        />
                    </div>

                    <div className="block md:hidden">
                        {vehicles.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {vehicles.data.map((v) => (
                                    <li key={v.id}>
                                        <DataTableCard
                                            title={v.plate}
                                            actions={
                                                <ActionButtons
                                                    showLabels
                                                    canEdit={can.update}
                                                    canDelete={can.delete}
                                                    canAssignPermissions={false}
                                                    onEdit={() => openEdit(v)}
                                                    onDelete={() => setDeleteVehicle(v)}
                                                    deleteUrl={can.delete ? `${vehiclesIndexPath}/${v.id}` : undefined}
                                                />
                                            }
                                            fields={[
                                                { label: 'Año', value: v.year ?? '—' },
                                                { label: 'Color', value: v.color ?? '—' },
                                                { label: 'Modelo', value: modelDisplay(v) },
                                                { label: 'Cliente', value: v.client?.name ?? '—' },
                                                {
                                                    label: 'Km ent./sal.',
                                                    value: `${v.entry_mileage ?? '—'} / ${v.exit_mileage ?? '—'}`,
                                                },
                                                ...(can.view_audit && v.audit_display
                                                    ? [{ label: 'Creado / Modificado', value: v.audit_display }]
                                                    : []),
                                                {
                                                    label: 'Estado',
                                                    value: v.status === 'active' ? 'Activo' : 'Inactivo',
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
                            from={vehicles.from}
                            to={vehicles.to}
                            total={vehicles.total}
                            perPage={vehicles.per_page}
                            currentPage={vehicles.current_page}
                            lastPage={vehicles.last_page}
                            links={vehicles.links}
                            indexPath={vehiclesIndexPath}
                            search={filters.search}
                            extraParams={{
                                sort_by: sortBy,
                                sort_dir: sortDir,
                                filter_status: filters.filter_status,
                                filter_brand_id: filters.filter_brand_id,
                                filter_model_id: filters.filter_model_id,
                                filter_client_id: filters.filter_client_id,
                            }}
                        />
                    </div>
                </div>
            </div>

            <VehicleFormModal
                open={formOpen}
                onOpenChange={closeForm}
                vehicle={editingVehicle}
                vehiclesIndexPath={vehiclesIndexPath}
                brandsForSelect={brandsForSelect}
                vehicleModelsForSelect={vehicleModelsForSelect}
                clientsForSelect={clientsForSelect}
            />
            <DeleteVehicleDialog
                open={Boolean(deleteVehicle)}
                onOpenChange={(open) => !open && setDeleteVehicle(null)}
                vehicle={deleteVehicle}
                vehiclesIndexPath={vehiclesIndexPath}
            />
        </AppLayout>
    );
}
