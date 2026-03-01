import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FileText, LayoutGrid, Plus, User, UserX, Inbox, Users } from 'lucide-react';
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
import { UserFormModal } from '@/components/UserFormModal';
import { DeleteUserDialog } from '@/components/DeleteUserDialog';

const getBreadcrumbs = (usersPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Usuarios', href: usersPath },
];

type RoleOption = { id: number; name: string };

type UsersIndexProps = {
    users: PaginatedResponse<UserType>;
    roles: RoleOption[];
    filters: {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        filter_status?: string;
    };
    usersIndexPath: string;
    stats: {
        total_users: number;
        active_users: number;
        last_updated?: string | null;
    };
    can: { create: boolean; update: boolean; delete: boolean };
};

export default function UsersIndex({ users, roles, filters, usersIndexPath, stats, can }: UsersIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [deleteUser, setDeleteUser] = useState<UserType | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const indexPath = usersIndexPath;

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const openCreate = () => {
        setEditingUser(null);
        setFormOpen(true);
    };
    const openEdit = (user: UserType) => {
        setEditingUser(user);
        setFormOpen(true);
    };
    const closeForm = (open: boolean) => {
        if (!open) setEditingUser(null);
        setFormOpen(open);
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
            render: (u: UserType) => (
                <span className="font-medium text-foreground">{u.name}</span>
            ),
        },
        {
            key: 'username',
            label: 'Usuario',
            sortKey: 'username',
            render: (u: UserType) => (
                <span className="text-muted-foreground text-sm">{u.username}</span>
            ),
        },
        {
            key: 'email',
            label: 'Correo',
            sortKey: 'email',
            render: (u: UserType) => (
                <span className="text-muted-foreground text-sm">{u.email || '—'}</span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            sortKey: 'status',
            render: (u: UserType) => (
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-content-muted/60 text-muted-foreground'
                    }`}
                >
                    {u.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            key: 'role',
            label: 'Rol',
            render: (u: UserType) => (
                <span className="text-muted-foreground text-sm">
                    {u.roles?.[0]?.name ?? '—'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[100px] text-right',
            render: (u: UserType) => {
                const isSuperadmin = u.username === 'superadmin';
                return (
                    <ActionButtons
                        canEdit={can.update && !isSuperadmin}
                        canDelete={can.delete && !isSuperadmin}
                        canAssignPermissions={false}
                        onEdit={() => openEdit(u)}
                        onDelete={() => setDeleteUser(u)}
                        deleteUrl={can.delete && !isSuperadmin ? `${usersIndexPath}/${u.id}` : undefined}
                    />
                );
            },
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay usuarios.</span>
            {can.create && (
                <Button size="sm" onClick={openCreate} className="cursor-pointer mt-1">
                    <Plus className="size-4 mr-1" />
                    Crear primer usuario
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(usersIndexPath)}>
            <Head title="Usuarios" />

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
                            Usuarios
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de usuarios del sistema.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {can.create && (
                            <Button
                                onClick={openCreate}
                                className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                            >
                                <Plus className="size-4" />
                                Nuevo usuario
                            </Button>
                        )}
                    </div>
                </div>

                {/* Estadísticas compactas: pills con iconos */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Users className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Usuarios</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.total_users}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <User className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Activos</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {stats.active_users}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {users.current_page}
                            <span className="font-normal text-muted-foreground"> / {users.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <LayoutGrid className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {users.data.length}
                        </span>
                    </span>
                    {stats.total_users - stats.active_users > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-content-muted/50 px-2.5 py-1">
                            <UserX className="size-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Inactivos</span>
                            <span className="font-semibold text-muted-foreground">
                                {stats.total_users - stats.active_users}
                            </span>
                        </span>
                    )}
                </div>

                {/* Separador sutil antes de la tabla */}
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
                                <span className="font-medium text-foreground">{users.total}</span>{' '}
                                resultado{users.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    {/* Tabla: pantallas medianas y grandes */}
                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<UserType>
                            columns={columns}
                            data={users.data}
                            keyExtractor={(u) => u.id}
                            emptyMessage="No hay usuarios. Cree uno para comenzar."
                            emptyContent={emptyContent}
                            embedded
                            striped
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                        />
                    </div>

                    {/* Cards: pantallas pequeñas */}
                    <div className="block md:hidden">
                        {users.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {users.data.map((u) => {
                                    const isSuperadmin = u.username === 'superadmin';
                                    return (
                                    <li key={u.id}>
                                        <DataTableCard
                                            title={u.name}
                                            actions={
                                                <ActionButtons
                                                    showLabels
                                                    canEdit={can.update && !isSuperadmin}
                                                    canDelete={can.delete && !isSuperadmin}
                                                    canAssignPermissions={false}
                                                    onEdit={() => openEdit(u)}
                                                    onDelete={() => setDeleteUser(u)}
                                                    deleteUrl={
                                                        can.delete && !isSuperadmin
                                                            ? `${usersIndexPath}/${u.id}`
                                                            : undefined
                                                    }
                                                />
                                            }
                                            fields={[
                                                { label: 'Usuario', value: u.username },
                                                { label: 'Correo', value: u.email || '—' },
                                                {
                                                    label: 'Estado',
                                                    value: u.status === 'active' ? 'Activo' : 'Inactivo',
                                                },
                                                {
                                                    label: 'Roles',
                                                    value: `${u.roles_count ?? 0} rol(es)`,
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
                            from={users.from}
                            to={users.to}
                            total={users.total}
                            perPage={users.per_page}
                            currentPage={users.current_page}
                            lastPage={users.last_page}
                            links={users.links}
                            indexPath={usersIndexPath}
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

            <UserFormModal
                open={formOpen}
                onOpenChange={closeForm}
                user={editingUser}
                usersIndexPath={usersIndexPath}
                roles={roles}
            />
            <DeleteUserDialog
                open={Boolean(deleteUser)}
                onOpenChange={(open) => !open && setDeleteUser(null)}
                user={deleteUser}
                usersIndexPath={usersIndexPath}
            />
        </AppLayout>
    );
}
