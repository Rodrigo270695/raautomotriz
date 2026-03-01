import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FileText, LayoutGrid, Plus, Inbox, Wrench, Package, ListChecks } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, ServicePackage, PaginatedResponse } from '@/types';
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
import { ServicePackageFormModal } from '@/components/ServicePackageFormModal';
import { DeleteServicePackageDialog } from '@/components/DeleteServicePackageDialog';

const getBreadcrumbs = (packagesPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Servicio', href: '#' },
    { title: 'Paquetes de servicio', href: packagesPath },
];

type PackagesIndexProps = {
    packages: PaginatedResponse<ServicePackage>;
    filters: {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        filter_status?: string;
    };
    packagesIndexPath: string;
    serviceTypesForSelect: Array<{ id: number; name: string }>;
    stats: {
        total_packages: number;
        total_active: number;
    };
    nextSortOrder: number;
    can: { create: boolean; update: boolean; delete: boolean; view_items: boolean };
};

export default function PackagesIndex({
    packages,
    filters,
    packagesIndexPath,
    serviceTypesForSelect,
    stats,
    nextSortOrder,
    can,
}: PackagesIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
    const [deletePackage, setDeletePackage] = useState<ServicePackage | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const indexPath = packagesIndexPath;

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
            only: ['serviceTypesForSelect', 'nextSortOrder'],
            preserveState: true,
        });
    };

    const openCreate = () => {
        setEditingPackage(null);
        setFormOpen(true);
        refreshSelectData();
    };
    const openEdit = (item: ServicePackage) => {
        setEditingPackage(item);
        setFormOpen(true);
        refreshSelectData();
    };
    const closeForm = (open: boolean) => {
        if (!open) setEditingPackage(null);
        setFormOpen(open);
    };

    const sortBy = filters.sort_by ?? 'sort_order';
    const sortDir = (filters.sort_dir ?? 'asc') as 'asc' | 'desc';
    const onSort = (key: string) => {
        const nextDir = sortBy === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        router.get(indexPath, { ...filters, sort_by: key, sort_dir: nextDir }, { preserveState: true });
    };
    const onFilterStatus = (value: string) => {
        router.get(indexPath, { ...filters, filter_status: value === 'all' ? undefined : value, page: undefined }, { preserveState: true });
    };

    const columns = [
        {
            key: 'name',
            label: 'Nombre',
            sortKey: 'name',
            render: (r: ServicePackage) => (
                <span className="font-medium text-foreground">{r.name}</span>
            ),
        },
        {
            key: 'service_type',
            label: 'Tipo',
            render: (r: ServicePackage) => (
                <span className="text-muted-foreground text-sm">
                    {r.service_type?.name ?? '—'}
                </span>
            ),
        },
        {
            key: 'description',
            label: 'Descripción',
            render: (r: ServicePackage) => (
                <span className="text-muted-foreground text-sm line-clamp-1 max-w-[200px]">
                    {r.description || '—'}
                </span>
            ),
        },
        {
            key: 'total',
            label: 'Total',
            render: (r: ServicePackage) => (
                <span className="text-muted-foreground text-sm tabular-nums">
                    S/ {Number(r.total_amount ?? 0).toFixed(2)}
                </span>
            ),
        },
        {
            key: 'sort_order',
            label: 'Orden',
            sortKey: 'sort_order',
            render: (r: ServicePackage) => (
                <span className="text-muted-foreground text-sm tabular-nums">{r.sort_order}</span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            sortKey: 'status',
            render: (r: ServicePackage) => (
                <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                        r.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-content-muted/60 text-muted-foreground'
                    }`}
                >
                    {r.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[150px] text-right',
            render: (r: ServicePackage) => (
                <div className="flex items-center justify-end gap-2">
                    {can.view_items && r.items_path && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="cursor-pointer shrink-0 text-violet-500 hover:bg-violet-50 hover:text-violet-600 dark:text-violet-400/80 dark:hover:bg-violet-900/20 dark:hover:text-violet-300"
                                    asChild
                                >
                                    <Link href={r.items_path} aria-label="Ver ítems del paquete">
                                        <ListChecks className="size-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ítems</TooltipContent>
                        </Tooltip>
                    )}
                    <ActionButtons
                        canEdit={can.update}
                        canDelete={can.delete}
                        onEdit={() => openEdit(r)}
                        onDelete={() => setDeletePackage(r)}
                        deleteUrl={can.delete ? `${packagesIndexPath}/${r.id}` : undefined}
                    />
                </div>
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay paquetes de servicio.</span>
            {can.create && (
                <Button size="sm" onClick={openCreate} className="cursor-pointer mt-1">
                    <Plus className="size-4 mr-1" />
                    Crear primer paquete
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(packagesIndexPath)}>
            <Head title="Paquetes de servicio" />

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
                            Paquetes de servicio
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de paquetes de servicio (nombre, tipo, descripción y estado).
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {can.create && (
                            <Button
                                onClick={openCreate}
                                className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                            >
                                <Plus className="size-4" />
                                Nuevo paquete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Package className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Paquetes</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.total_packages}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <Wrench className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">Activos</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {stats.total_active}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {packages.current_page}
                            <span className="font-normal text-muted-foreground"> / {packages.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <LayoutGrid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {packages.data.length}
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
                                placeholder="Buscar por nombre, descripción o tipo…"
                                className="w-full sm:w-72"
                                inputClassName="focus-visible:border-primary/50 focus-visible:ring-primary/30"
                            />
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
                        {filters.search != null && filters.search !== '' && (
                            <p className="mt-2 text-muted-foreground text-sm">
                                <span className="font-medium text-foreground">{packages.total}</span>{' '}
                                resultado{packages.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<ServicePackage>
                            columns={columns}
                            data={packages.data}
                            keyExtractor={(r) => r.id}
                            emptyMessage="No hay paquetes de servicio. Cree uno para comenzar."
                            emptyContent={emptyContent}
                            embedded
                            striped
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                        />
                    </div>

                    <div className="block md:hidden">
                        {packages.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {packages.data.map((item) => (
                                    <li key={item.id}>
                                        <DataTableCard
                                            title={item.name}
                                            actions={
                                                <div className="flex items-center justify-end gap-2">
                                                    {can.view_items && item.items_path && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer shrink-0 text-violet-500 hover:bg-violet-50 hover:text-violet-600 dark:text-violet-400/80 dark:hover:bg-violet-900/20 dark:hover:text-violet-300"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={item.items_path}
                                                                aria-label="Ver ítems del paquete"
                                                            >
                                                                Ítems
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    <ActionButtons
                                                        showLabels
                                                        canEdit={can.update}
                                                        canDelete={can.delete}
                                                        onEdit={() => openEdit(item)}
                                                        onDelete={() => setDeletePackage(item)}
                                                        deleteUrl={
                                                            can.delete
                                                                ? `${packagesIndexPath}/${item.id}`
                                                                : undefined
                                                        }
                                                    />
                                                </div>
                                            }
                                            fields={[
                                                {
                                                    label: 'Tipo',
                                                    value: item.service_type?.name ?? '—',
                                                },
                                                {
                                                    label: 'Descripción',
                                                    value: item.description || '—',
                                                },
                                                {
                                                    label: 'Orden',
                                                    value: String(item.sort_order),
                                                },
                                                {
                                                    label: 'Total',
                                                    value: `S/ ${Number(item.total_amount ?? 0).toFixed(2)}`,
                                                },
                                                {
                                                    label: 'Estado',
                                                    value: item.status === 'active' ? 'Activo' : 'Inactivo',
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
                            from={packages.from}
                            to={packages.to}
                            total={packages.total}
                            perPage={packages.per_page}
                            currentPage={packages.current_page}
                            lastPage={packages.last_page}
                            links={packages.links}
                            indexPath={packagesIndexPath}
                            search={filters.search}
                            extraParams={{
                                sort_by: sortBy,
                                sort_dir: sortDir,
                                filter_status: filters.filter_status,
                            }}
                        />
                    </div>
                </div>
            </div>

            <ServicePackageFormModal
                open={formOpen}
                onOpenChange={closeForm}
                package={editingPackage}
                packagesIndexPath={packagesIndexPath}
                serviceTypesForSelect={serviceTypesForSelect}
                nextSortOrder={nextSortOrder}
            />
            <DeleteServicePackageDialog
                open={Boolean(deletePackage)}
                onOpenChange={(open) => !open && setDeletePackage(null)}
                package={deletePackage}
                packagesIndexPath={packagesIndexPath}
            />
        </AppLayout>
    );
}
