import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FileText, KeyRound, LayoutGrid, Plus, Users, ShieldOff, Inbox } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Role, PaginatedResponse } from '@/types';
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
import { RoleFormModal } from '@/components/RoleFormModal';
import { DeleteRoleDialog } from '@/components/DeleteRoleDialog';
import { AssignPermissionsModal } from '@/components/AssignPermissionsModal';
import type { PermissionsGrouped } from '@/components/AssignPermissionsModal';

const getBreadcrumbs = (rolesPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Roles', href: rolesPath },
];

type RolesIndexProps = {
    roles: PaginatedResponse<Role>;
    filters: {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        filter_permissions?: string;
    };
    rolesIndexPath: string;
    stats: {
        total_roles: number;
        total_permissions: number;
        roles_without_permissions?: number;
        last_updated?: string | null;
    };
    permissionsGrouped?: PermissionsGrouped;
    can: { create: boolean; update: boolean; delete: boolean; view_permissions?: boolean; assign_permissions?: boolean };
};

export default function RolesIndex({ roles, filters, rolesIndexPath, stats, permissionsGrouped = {}, can }: RolesIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deleteRole, setDeleteRole] = useState<Role | null>(null);
    const [roleForPermissions, setRoleForPermissions] = useState<Role | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const indexPath = rolesIndexPath;

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const openCreate = () => {
        setEditingRole(null);
        setFormOpen(true);
    };
    const openEdit = (role: Role) => {
        setEditingRole(role);
        setFormOpen(true);
    };
    const closeForm = (open: boolean) => {
        if (!open) setEditingRole(null);
        setFormOpen(open);
    };

    const sortBy = filters.sort_by ?? 'name';
    const sortDir = (filters.sort_dir ?? 'asc') as 'asc' | 'desc';
    const onSort = (key: string) => {
        const nextDir = sortBy === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        router.get(indexPath, { ...filters, sort_by: key, sort_dir: nextDir }, { preserveState: true });
    };
    const onFilterPermissions = (value: string) => {
        router.get(indexPath, { ...filters, filter_permissions: value === 'all' ? undefined : value, page: undefined }, { preserveState: true });
    };

    const columns = [
        {
            key: 'name',
            label: 'Nombre',
            sortKey: 'name',
            render: (r: Role) => (
                <span className="font-medium text-foreground">{r.name}</span>
            ),
        },
        {
            key: 'permissions_count',
            label: 'Permisos',
            sortKey: 'permissions_count',
            render: (r: Role) => (
                <span className="text-muted-foreground text-sm">{r.permissions_count}</span>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[100px] text-right',
            render: (r: Role) => (
                <ActionButtons
                    canEdit={can.update}
                    canDelete={can.delete}
                    canAssignPermissions={can.assign_permissions}
                    onEdit={() => openEdit(r)}
                    onDelete={() => setDeleteRole(r)}
                    onAssignPermissions={() => setRoleForPermissions(r)}
                    deleteUrl={can.delete ? `${rolesIndexPath}/${r.id}` : undefined}
                />
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay roles.</span>
            {can.create && (
                <Button size="sm" onClick={openCreate} className="cursor-pointer mt-1">
                    <Plus className="size-4 mr-1" />
                    Crear primer rol
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(rolesIndexPath)}>
            <Head title="Roles" />

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
                            Roles
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de roles y permisos del sistema.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {can.create && (
                            <Button
                                onClick={openCreate}
                                className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                            >
                                <Plus className="size-4" />
                                Nuevo rol
                            </Button>
                        )}
                    </div>
                </div>

                {/* Estadísticas compactas: pills con iconos */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Users className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Roles</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.total_roles}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <KeyRound className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">Tipos de permiso</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {stats.total_permissions}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {roles.current_page}
                            <span className="font-normal text-muted-foreground"> / {roles.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <LayoutGrid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {roles.data.length}
                        </span>
                    </span>
                    {stats.roles_without_permissions !== undefined && (
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                                (stats.roles_without_permissions ?? 0) > 0
                                    ? 'bg-amber-50 dark:bg-amber-950/40'
                                    : 'bg-content-muted/50'
                            }`}
                        >
                            <ShieldOff
                                className={`size-3.5 ${
                                    (stats.roles_without_permissions ?? 0) > 0
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-muted-foreground'
                                }`}
                            />
                            <span className="text-muted-foreground">Sin permisos</span>
                            <span
                                className={`font-semibold ${
                                    (stats.roles_without_permissions ?? 0) > 0
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {stats.roles_without_permissions ?? 0}
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
                                placeholder="Buscar por nombre…"
                                className="w-full sm:w-72"
                                inputClassName="focus-visible:border-primary/50 focus-visible:ring-primary/30"
                            />
                            <Select
                                value={filters.filter_permissions ?? 'all'}
                                onValueChange={onFilterPermissions}
                            >
                                <SelectTrigger className="w-full sm:w-44 border-content-border">
                                    <SelectValue placeholder="Permisos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="with">Con permisos</SelectItem>
                                    <SelectItem value="without">Sin permisos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {filters.search != null && filters.search !== '' && (
                            <p className="mt-2 text-muted-foreground text-sm">
                                <span className="font-medium text-foreground">{roles.total}</span>{' '}
                                resultado{roles.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    {/* Tabla: pantallas medianas y grandes */}
                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<Role>
                            columns={columns}
                            data={roles.data}
                            keyExtractor={(r) => r.id}
                            emptyMessage="No hay roles. Cree uno para comenzar."
                            emptyContent={emptyContent}
                            embedded
                            striped
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                        />
                    </div>

                    {/* Cards: pantallas pequeñas (diseño escalable a muchos campos) */}
                    <div className="block md:hidden">
                        {roles.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {roles.data.map((role) => (
                                    <li key={role.id}>
                                        <DataTableCard
                                            title={role.name}
                                            actions={
                                                <ActionButtons
                                                    showLabels
                                                    canEdit={can.update}
                                                    canDelete={can.delete}
                                                    canAssignPermissions={can.assign_permissions}
                                                    onEdit={() => openEdit(role)}
                                                    onDelete={() =>
                                                        setDeleteRole(role)
                                                    }
                                                    onAssignPermissions={() =>
                                                        setRoleForPermissions(role)
                                                    }
                                                    deleteUrl={
                                                        can.delete
                                                            ? `${rolesIndexPath}/${role.id}`
                                                            : undefined
                                                    }
                                                />
                                            }
                                            fields={[
                                                {
                                                    label: 'Permisos',
                                                    value: `${role.permissions_count} permiso${role.permissions_count !== 1 ? 's' : ''}`,
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
                            from={roles.from}
                            to={roles.to}
                            total={roles.total}
                            perPage={roles.per_page}
                            currentPage={roles.current_page}
                            lastPage={roles.last_page}
                            links={roles.links}
                            indexPath={rolesIndexPath}
                            search={filters.search}
                            extraParams={{
                                sort_by: sortBy,
                                sort_dir: sortDir,
                                filter_permissions: filters.filter_permissions,
                            }}
                        />
                    </div>
                </div>
            </div>

            <RoleFormModal
                open={formOpen}
                onOpenChange={closeForm}
                role={editingRole}
                rolesIndexPath={rolesIndexPath}
            />
            <DeleteRoleDialog
                open={Boolean(deleteRole)}
                onOpenChange={(open) => !open && setDeleteRole(null)}
                role={deleteRole}
                rolesIndexPath={rolesIndexPath}
            />
            {can.assign_permissions && (
                <AssignPermissionsModal
                    open={Boolean(roleForPermissions)}
                    onOpenChange={(open) => !open && setRoleForPermissions(null)}
                    role={roleForPermissions}
                    rolesBasePath={rolesIndexPath}
                    onSuccess={() => router.reload()}
                />
            )}
        </AppLayout>
    );
}
