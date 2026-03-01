import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FileText, LayoutGrid, Plus, Inbox, Wrench, ClipboardList } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, ServiceType, PaginatedResponse } from '@/types';
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
import { ServiceTypeFormModal } from '@/components/ServiceTypeFormModal';
import { DeleteTypeDialog } from '@/components/DeleteTypeDialog';

const getBreadcrumbs = (typesPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Servicio', href: '#' },
    { title: 'Tipo de servicio', href: typesPath },
];

type TypesIndexProps = {
    types: PaginatedResponse<ServiceType>;
    filters: {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        filter_status?: string;
    };
    typesIndexPath: string;
    stats: {
        total_types: number;
        total_active: number;
    };
    can: { create: boolean; update: boolean; delete: boolean };
};

export default function TypesIndex({
    types,
    filters,
    typesIndexPath,
    stats,
    can,
}: TypesIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingType, setEditingType] = useState<ServiceType | null>(null);
    const [deleteType, setDeleteType] = useState<ServiceType | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const indexPath = typesIndexPath;

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const openCreate = () => {
        setEditingType(null);
        setFormOpen(true);
    };
    const openEdit = (item: ServiceType) => {
        setEditingType(item);
        setFormOpen(true);
    };
    const closeForm = (open: boolean) => {
        if (!open) setEditingType(null);
        setFormOpen(open);
    };

    const sortBy = filters.sort_by ?? 'name';
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
            render: (r: ServiceType) => (
                <span className="font-medium text-foreground">{r.name}</span>
            ),
        },
        {
            key: 'description',
            label: 'Descripción',
            render: (r: ServiceType) => (
                <span className="text-muted-foreground text-sm line-clamp-1 max-w-[200px]">
                    {r.description || '—'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            sortKey: 'status',
            render: (r: ServiceType) => (
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
            className: 'w-[100px] text-right',
            render: (r: ServiceType) => (
                <ActionButtons
                    canEdit={can.update}
                    canDelete={can.delete}
                    onEdit={() => openEdit(r)}
                    onDelete={() => setDeleteType(r)}
                    deleteUrl={can.delete ? `${typesIndexPath}/${r.id}` : undefined}
                />
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay tipos de servicio.</span>
            {can.create && (
                <Button size="sm" onClick={openCreate} className="cursor-pointer mt-1">
                    <Plus className="size-4 mr-1" />
                    Crear primer tipo
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(typesIndexPath)}>
            <Head title="Tipo de servicio" />

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
                            Tipo de servicio
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de tipos de servicio (nombre, descripción y estado).
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {can.create && (
                            <Button
                                onClick={openCreate}
                                className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                            >
                                <Plus className="size-4" />
                                Nuevo tipo
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <ClipboardList className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Tipos</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.total_types}
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
                            {types.current_page}
                            <span className="font-normal text-muted-foreground"> / {types.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <LayoutGrid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {types.data.length}
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
                                placeholder="Buscar por nombre o descripción…"
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
                                <span className="font-medium text-foreground">{types.total}</span>{' '}
                                resultado{types.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<ServiceType>
                            columns={columns}
                            data={types.data}
                            keyExtractor={(r) => r.id}
                            emptyMessage="No hay tipos de servicio. Cree uno para comenzar."
                            emptyContent={emptyContent}
                            embedded
                            striped
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                        />
                    </div>

                    <div className="block md:hidden">
                        {types.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {types.data.map((item) => (
                                    <li key={item.id}>
                                        <DataTableCard
                                            title={item.name}
                                            actions={
                                                <ActionButtons
                                                    showLabels
                                                    canEdit={can.update}
                                                    canDelete={can.delete}
                                                    onEdit={() => openEdit(item)}
                                                    onDelete={() => setDeleteType(item)}
                                                    deleteUrl={
                                                        can.delete
                                                            ? `${typesIndexPath}/${item.id}`
                                                            : undefined
                                                    }
                                                />
                                            }
                                            fields={[
                                                {
                                                    label: 'Descripción',
                                                    value: item.description || '—',
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
                            from={types.from}
                            to={types.to}
                            total={types.total}
                            perPage={types.per_page}
                            currentPage={types.current_page}
                            lastPage={types.last_page}
                            links={types.links}
                            indexPath={typesIndexPath}
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

            <ServiceTypeFormModal
                open={formOpen}
                onOpenChange={closeForm}
                type={editingType}
                typesIndexPath={typesIndexPath}
            />
            <DeleteTypeDialog
                open={Boolean(deleteType)}
                onOpenChange={(open) => !open && setDeleteType(null)}
                type={deleteType}
                typesIndexPath={typesIndexPath}
            />
        </AppLayout>
    );
}
