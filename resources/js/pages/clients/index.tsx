import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Car, FileSpreadsheet, FileText, LayoutGrid, Plus, User, UserX, Inbox, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, User as UserType, PaginatedResponse } from '@/types';
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
import { ClientFormModal } from '@/components/ClientFormModal';
import { DeleteUserDialog } from '@/components/DeleteUserDialog';
import { VehicleFormModal } from '@/components/VehicleFormModal';

const getBreadcrumbs = (clientsPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Usuarios', href: '/dashboard/users' },
    { title: 'Clientes', href: clientsPath },
];

type ClientsIndexProps = {
    clients: PaginatedResponse<UserType>;
    filters: {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        filter_status?: string;
    };
    clientsIndexPath: string;
    vehiclesIndexPath: string;
    brandsForSelect: Array<{ id: number; name: string }>;
    vehicleModelsForSelect: Array<{ id: number; name: string; brand_id: number; brand_name: string }>;
    clientsForSelect: Array<{ id: number; name: string; first_name?: string; last_name?: string; document_number?: string }>;
    stats: {
        total_clients: number;
        active_clients: number;
        last_updated?: string | null;
    };
    can: { create: boolean; update: boolean; delete: boolean; add_vehicle: boolean; export: boolean };
    exportUrl: string;
};

export default function ClientsIndex({
    clients,
    filters,
    clientsIndexPath,
    vehiclesIndexPath,
    brandsForSelect,
    vehicleModelsForSelect,
    clientsForSelect,
    stats,
    can,
    exportUrl,
}: ClientsIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<UserType | null>(null);
    const [deleteClient, setDeleteClient] = useState<UserType | null>(null);
    const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
    const [clientForVehicle, setClientForVehicle] = useState<UserType | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const indexPath = clientsIndexPath;

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const openCreate = () => {
        setEditingClient(null);
        setFormOpen(true);
    };
    const openEdit = (client: UserType) => {
        setEditingClient(client);
        setFormOpen(true);
    };
    const closeForm = (open: boolean) => {
        if (!open) setEditingClient(null);
        setFormOpen(open);
    };

    const openAddVehicle = (client: UserType) => {
        setClientForVehicle(client);
        setVehicleFormOpen(true);
    };
    const closeVehicleForm = (open: boolean) => {
        if (!open) setClientForVehicle(null);
        setVehicleFormOpen(open);
    };

    const sortBy = filters.sort_by ?? 'first_name';
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
            sortKey: 'first_name',
            render: (c: UserType) => (
                <span className="font-medium text-foreground">{c.name}</span>
            ),
        },
        {
            key: 'username',
            label: 'DNI / Doc.',
            sortKey: 'username',
            render: (c: UserType) => (
                <span className="text-muted-foreground text-sm">{c.username}</span>
            ),
        },
        {
            key: 'email',
            label: 'Correo',
            sortKey: 'email',
            render: (c: UserType) => (
                <span className="text-muted-foreground text-sm">{c.email || '—'}</span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            sortKey: 'status',
            render: (c: UserType) => (
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-content-muted/60 text-muted-foreground'
                    }`}
                >
                    {c.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            key: 'vehicles_count',
            label: 'Vehículos',
            render: (c: UserType) => {
                const count = c.vehicles_count ?? 0;
                return (
                    <button
                        type="button"
                        onClick={() => router.get(vehiclesIndexPath, { filter_client_id: c.id }, { preserveState: false })}
                        className="cursor-pointer inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        title={count > 0 ? `Ver ${count} vehículo(s) de este cliente` : 'Sin vehículos'}
                    >
                        <Car className="size-4 shrink-0 text-current opacity-80" aria-hidden />
                        {count}
                    </button>
                );
            },
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[120px] text-right',
            render: (c: UserType) => (
                <div className="flex items-center justify-end gap-2">
                    {can.add_vehicle && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="cursor-pointer shrink-0 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-emerald-400/80 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300"
                                    onClick={() => openAddVehicle(c)}
                                    aria-label="Agregar vehículo"
                                >
                                    <Car className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Agregar vehículo</TooltipContent>
                        </Tooltip>
                    )}
                    <ActionButtons
                        canEdit={can.update}
                        canDelete={can.delete}
                        canAssignPermissions={false}
                        onEdit={() => openEdit(c)}
                        onDelete={() => setDeleteClient(c)}
                        deleteUrl={can.delete ? `${clientsIndexPath}/${c.id}` : undefined}
                    />
                </div>
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay clientes.</span>
            {can.create && (
                <Button size="sm" onClick={openCreate} className="cursor-pointer mt-1">
                    <Plus className="size-4 mr-1" />
                    Crear primer cliente
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(clientsIndexPath)}>
            <Head title="Clientes" />

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
                            Clientes
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de clientes del sistema.
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
                                Nuevo cliente
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Users className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Clientes</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.total_clients}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <User className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Activos</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {stats.active_clients}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {clients.current_page}
                            <span className="font-normal text-muted-foreground"> / {clients.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <LayoutGrid className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {clients.data.length}
                        </span>
                    </span>
                    {stats.total_clients - stats.active_clients > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-content-muted/50 px-2.5 py-1">
                            <UserX className="size-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Inactivos</span>
                            <span className="font-semibold text-muted-foreground">
                                {stats.total_clients - stats.active_clients}
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
                                placeholder="Buscar por nombre, usuario o correo…"
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
                                <span className="font-medium text-foreground">{clients.total}</span>{' '}
                                resultado{clients.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<UserType>
                            columns={columns}
                            data={clients.data}
                            keyExtractor={(c) => c.id}
                            emptyMessage="No hay clientes. Cree uno para comenzar."
                            emptyContent={emptyContent}
                            embedded
                            striped
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                        />
                    </div>

                    <div className="block md:hidden">
                        {clients.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {clients.data.map((c) => (
                                    <li key={c.id}>
                                        <DataTableCard
                                            title={c.name}
                                            actions={
                                                <div className="flex flex-wrap items-center justify-end gap-2">
                                                    {can.add_vehicle && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="cursor-pointer shrink-0 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-emerald-400/80 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300"
                                                                    onClick={() => openAddVehicle(c)}
                                                                    aria-label="Agregar vehículo"
                                                                >
                                                                    Agregar vehículo
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Agregar vehículo</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    <ActionButtons
                                                        showLabels
                                                        className="shrink-0"
                                                        canEdit={can.update}
                                                        canDelete={can.delete}
                                                        canAssignPermissions={false}
                                                        onEdit={() => openEdit(c)}
                                                        onDelete={() => setDeleteClient(c)}
                                                        deleteUrl={
                                                            can.delete
                                                                ? `${clientsIndexPath}/${c.id}`
                                                                : undefined
                                                        }
                                                    />
                                                </div>
                                            }
                                            fields={[
                                                { label: 'DNI / Doc.', value: c.username },
                                                { label: 'Correo', value: c.email || '—' },
                                                {
                                                    label: 'Estado',
                                                    value: c.status === 'active' ? 'Activo' : 'Inactivo',
                                                },
                                                {
                                                    label: 'Vehículos',
                                                    value: (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.get(vehiclesIndexPath, { filter_client_id: c.id }, { preserveState: false })
                                                            }
                                                            className="cursor-pointer inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            <Car className="size-4 shrink-0 text-current opacity-80" />
                                                            {c.vehicles_count ?? 0}
                                                        </button>
                                                    ),
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
                            from={clients.from}
                            to={clients.to}
                            total={clients.total}
                            perPage={clients.per_page}
                            currentPage={clients.current_page}
                            lastPage={clients.last_page}
                            links={clients.links}
                            indexPath={clientsIndexPath}
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

            <ClientFormModal
                open={formOpen}
                onOpenChange={closeForm}
                client={editingClient}
                clientsIndexPath={clientsIndexPath}
            />
            <VehicleFormModal
                open={vehicleFormOpen}
                onOpenChange={closeVehicleForm}
                vehicle={null}
                vehiclesIndexPath={vehiclesIndexPath}
                brandsForSelect={brandsForSelect}
                vehicleModelsForSelect={vehicleModelsForSelect}
                clientsForSelect={clientsForSelect}
                preselectedClientId={clientForVehicle?.id ?? null}
                redirectFilterClientId={clientForVehicle?.id ?? null}
            />
            <DeleteUserDialog
                open={Boolean(deleteClient)}
                onOpenChange={(open) => !open && setDeleteClient(null)}
                user={deleteClient}
                usersIndexPath={clientsIndexPath}
            />
        </AppLayout>
    );
}
