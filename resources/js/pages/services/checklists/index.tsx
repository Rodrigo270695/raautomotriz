import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FileText, LayoutGrid, Plus, Inbox, ListChecks, ClipboardList } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, ServiceChecklist, PaginatedResponse } from '@/types';
import { DataTable } from '@/components/data-table';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import { ActionButtons, OrderMoveButtons } from '@/components/actions';
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
import { cn } from '@/lib/utils';
import { ServiceChecklistFormModal } from '@/components/ServiceChecklistFormModal';
import { DeleteChecklistDialog } from '@/components/DeleteChecklistDialog';

const getBreadcrumbs = (checklistsPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Servicio', href: '#' },
    { title: 'Lista de chequeo', href: checklistsPath },
];

type ChecklistsIndexProps = {
    checklists: PaginatedResponse<ServiceChecklist>;
    next_order_number: number;
    max_active_order_number: number;
    filters: {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        filter_status?: string;
    };
    checklistsIndexPath: string;
    stats: {
        total_checklists: number;
        total_active: number;
    };
    can: { create: boolean; update: boolean; delete: boolean; reorder: boolean };
};

export default function ChecklistsIndex({
    checklists,
    next_order_number = 1,
    max_active_order_number = 0,
    filters,
    checklistsIndexPath,
    stats,
    can,
}: ChecklistsIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingChecklist, setEditingChecklist] = useState<ServiceChecklist | null>(null);
    const [deleteChecklist, setDeleteChecklist] = useState<ServiceChecklist | null>(null);
    const [selectedChecklist, setSelectedChecklist] = useState<ServiceChecklist | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const indexPath = checklistsIndexPath;

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const openCreate = () => {
        setEditingChecklist(null);
        setFormOpen(true);
    };
    const openEdit = (item: ServiceChecklist) => {
        setEditingChecklist(item);
        setFormOpen(true);
    };
    const closeForm = (open: boolean) => {
        if (!open) setEditingChecklist(null);
        setFormOpen(open);
    };

    const sortBy = filters.sort_by ?? 'order_number';
    const sortDir = (filters.sort_dir ?? 'asc') as 'asc' | 'desc';
    const onSort = (key: string) => {
        const nextDir = sortBy === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        router.get(indexPath, { ...filters, sort_by: key, sort_dir: nextDir }, { preserveState: true });
    };
    const onFilterStatus = (value: string) => {
        router.get(indexPath, { ...filters, filter_status: value === 'all' ? undefined : value, page: undefined }, { preserveState: true });
    };

    const moveUp = (r: ServiceChecklist) => {
        if (!can.reorder || isInactive(r) || (r.order_number ?? 0) <= 1) return;
        router.put(`${checklistsIndexPath}/${r.id}/move-up`, {}, { preserveScroll: true });
    };
    const moveDown = (r: ServiceChecklist) => {
        if (!can.reorder || isInactive(r) || (r.order_number ?? 0) >= max_active_order_number) return;
        router.put(`${checklistsIndexPath}/${r.id}/move-down`, {}, { preserveScroll: true });
    };

    const isInactive = (r: ServiceChecklist) => r.status === 'inactive' || r.order_number == null;
    const rowMuted = (r: ServiceChecklist) => (isInactive(r) ? 'opacity-60 text-muted-foreground' : '');

    const columns = [
        {
            key: 'order_number',
            label: 'Nº orden',
            sortKey: 'order_number',
            render: (r: ServiceChecklist) => (
                <span className={cn('font-medium tabular-nums', rowMuted(r))}>
                    {isInactive(r) ? '—' : (r.order_number ?? '—')}
                </span>
            ),
        },
        {
            key: 'name',
            label: 'Nombre',
            sortKey: 'name',
            render: (r: ServiceChecklist) => (
                <span className={cn('font-medium text-foreground', rowMuted(r))}>{r.name}</span>
            ),
        },
        {
            key: 'description',
            label: 'Descripción',
            render: (r: ServiceChecklist) => (
                <span className={cn('text-sm line-clamp-1 max-w-[200px] text-muted-foreground', rowMuted(r))}>
                    {r.description || '—'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            sortKey: 'status',
            render: (r: ServiceChecklist) => (
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
            className: 'w-[120px] py-2 text-right align-middle',
            render: (r: ServiceChecklist) => {
                const isSelected = selectedChecklist?.id === r.id;
                const canMoveUp = can.reorder && !isInactive(r) && (r.order_number ?? 0) > 1;
                const canMoveDown = can.reorder && !isInactive(r) && (r.order_number ?? 0) < max_active_order_number;
                return (
                    <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                        role="presentation"
                    >
                        {isSelected && (
                            <OrderMoveButtons
                                vertical
                                canMoveUp={canMoveUp}
                                canMoveDown={canMoveDown}
                                onMoveUp={() => moveUp(r)}
                                onMoveDown={() => moveDown(r)}
                            />
                        )}
                        <ActionButtons
                            canEdit={can.update}
                            canDelete={can.delete}
                            onEdit={() => openEdit(r)}
                            onDelete={() => setDeleteChecklist(r)}
                            deleteUrl={can.delete ? `${checklistsIndexPath}/${r.id}` : undefined}
                        />
                    </div>
                );
            },
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay listas de chequeo.</span>
            {can.create && (
                <Button size="sm" onClick={openCreate} className="cursor-pointer mt-1">
                    <Plus className="size-4 mr-1" />
                    Crear primera lista
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(checklistsIndexPath)}>
            <Head title="Lista de chequeo" />

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
                            Lista de chequeo
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de listas de chequeo para servicios.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {can.create && (
                            <Button
                                onClick={openCreate}
                                className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                            >
                                <Plus className="size-4" />
                                Nueva lista
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <ClipboardList className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Listas</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.total_checklists}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <ListChecks className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">Activas</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {stats.total_active}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {checklists.current_page}
                            <span className="font-normal text-muted-foreground"> / {checklists.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <LayoutGrid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {checklists.data.length}
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
                                <span className="font-medium text-foreground">{checklists.total}</span>{' '}
                                resultado{checklists.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<ServiceChecklist>
                            columns={columns}
                            data={checklists.data}
                            keyExtractor={(r) => r.id}
                            emptyMessage="No hay listas de chequeo. Cree una para comenzar."
                            emptyContent={emptyContent}
                            embedded
                            striped
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                            onRowClick={(r) => setSelectedChecklist((prev) => (prev?.id === r.id ? null : r))}
                            getRowClassName={(r) =>
                                selectedChecklist?.id === r.id ? 'bg-primary/10 dark:bg-primary/20' : ''
                            }
                        />
                    </div>
                    <p className="hidden md:block px-4 text-muted-foreground text-xs">
                        Clic en una fila para mostrar Subir y Bajar.
                    </p>

                    <div className="block md:hidden">
                        {checklists.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {checklists.data.map((item) => {
                                    const inactive = isInactive(item);
                                    const isSelected = selectedChecklist?.id === item.id;
                                    const canMoveUp = can.reorder && !inactive && (item.order_number ?? 0) > 1;
                                    const canMoveDown = can.reorder && !inactive && (item.order_number ?? 0) < max_active_order_number;
                                    return (
                                        <li
                                            key={item.id}
                                            className={cn(
                                                'cursor-pointer rounded-xl border border-content-border transition-colors hover:bg-content-muted/30',
                                                inactive && 'opacity-70',
                                                isSelected && 'ring-2 ring-primary/50 bg-primary/10 dark:bg-primary/20'
                                            )}
                                            onClick={() =>
                                                setSelectedChecklist((prev) => (prev?.id === item.id ? null : item))
                                            }
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setSelectedChecklist((prev) =>
                                                        prev?.id === item.id ? null : item
                                                    );
                                                }
                                            }}
                                        >
                                            <DataTableCard
                                                title={inactive ? item.name : `${item.order_number ?? '—'}. ${item.name}`}
                                                actions={
                                                    <div
                                                        className="flex items-center justify-end gap-2 flex-wrap"
                                                        onClick={(e) => e.stopPropagation()}
                                                        role="presentation"
                                                    >
                                                        {isSelected && (
                                                            <OrderMoveButtons
                                                                vertical
                                                                showLabels
                                                                canMoveUp={canMoveUp}
                                                                canMoveDown={canMoveDown}
                                                                onMoveUp={() => moveUp(item)}
                                                                onMoveDown={() => moveDown(item)}
                                                            />
                                                        )}
                                                        <ActionButtons
                                                            showLabels
                                                            canEdit={can.update}
                                                            canDelete={can.delete}
                                                            onEdit={() => openEdit(item)}
                                                            onDelete={() => setDeleteChecklist(item)}
                                                            deleteUrl={
                                                                can.delete
                                                                    ? `${checklistsIndexPath}/${item.id}`
                                                                    : undefined
                                                            }
                                                        />
                                                    </div>
                                                }
                                                fields={[
                                                    {
                                                        label: 'Nº orden',
                                                        value: inactive ? '—' : String(item.order_number ?? '—'),
                                                    },
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
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="border-t border-content-border px-3 py-3 sm:px-4">
                        <TablePagination
                            from={checklists.from}
                            to={checklists.to}
                            total={checklists.total}
                            perPage={checklists.per_page}
                            currentPage={checklists.current_page}
                            lastPage={checklists.last_page}
                            links={checklists.links}
                            indexPath={checklistsIndexPath}
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

            <ServiceChecklistFormModal
                open={formOpen}
                onOpenChange={closeForm}
                checklist={editingChecklist}
                checklistsIndexPath={checklistsIndexPath}
                nextOrderNumber={next_order_number}
            />
            <DeleteChecklistDialog
                open={Boolean(deleteChecklist)}
                onOpenChange={(open) => !open && setDeleteChecklist(null)}
                checklist={deleteChecklist}
                checklistsIndexPath={checklistsIndexPath}
            />
        </AppLayout>
    );
}
