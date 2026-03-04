import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
    Car,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    KeyRound,
    LayoutGrid,
    Loader2,
    User,
    Users,
} from 'lucide-react';
import type { Role } from '@/types';

export type PermissionsGrouped = Record<string, string[]>;

const actionLabels: Record<string, string> = {
    send_notification: 'Enviar notificación a clientes',
    view: 'Ver',
    view_financial: 'Ver detalle financiero (ingresos, inventario)',
    create: 'Crear',
    update: 'Editar',
    delete: 'Eliminar',
    reorder: 'Reordenar',
    add_vehicle: 'Agregar vehículo',
    export: 'Descargar Excel',
    view_audit: 'Ver creado/modificado',
    print_ticket: 'Imprimir ticket de pago',
    resend_notification: 'Reenviar aviso / comprobante',
    print: 'Imprimir ticket de orden',
    view_summary: 'Ver resumen (entregadas)',
    print_summary: 'Descargar PDF resumen',
    mark_delivered: 'Marcar como entregado',
};

/** Permiso especial que se muestra bajo "Roles" como "Gestionar permisos" */
const PERMISSIONS_VIEW_AS_LABEL = 'Gestionar permisos';

function getActionLabel(action: string): string {
    return actionLabels[action] ?? action;
}

function PermissionRow({
    perm,
    checked,
    onToggle,
}: {
    perm: { name: string; label: string };
    checked: boolean;
    onToggle: () => void;
}) {
    const isPermissionsView = perm.name === 'permissions.view';
    return (
        <li>
            <label
                className="flex cursor-pointer items-center gap-2.5 border-b border-content-border/40 py-1 pl-8 pr-2 last:border-b-0 hover:bg-content-muted/30"
                title={isPermissionsView ? 'Permite ver el listado de permisos del sistema.' : undefined}
            >
                <Checkbox
                    checked={checked}
                    onCheckedChange={onToggle}
                    className="size-3.5 shrink-0 rounded-[3px] border-content-border"
                />
                <span className="text-foreground text-sm">{perm.label}</span>
                {isPermissionsView && (
                    <span className="text-muted-foreground text-xs">(listado)</span>
                )}
            </label>
        </li>
    );
}

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts[1].split(';').shift() ?? '');
    return null;
}

type MenuItem = { id: string; label: string; permissions: Array<{ name: string; label: string }> };
type MenuGroup = { id: string; label: string; children: MenuItem[] };
type MenuTreeNode = MenuItem | MenuGroup;

function isMenuGroup(node: MenuTreeNode): node is MenuGroup {
    return 'children' in node && Array.isArray((node as MenuGroup).children);
}

/** Jerarquía igual que el sidebar: Panel de control + Usuarios (Roles, Usuarios). */
function buildMenuTree(permissionsGrouped: PermissionsGrouped): MenuTreeNode[] {
    const result: MenuTreeNode[] = [];

    // 1. Panel de control (dashboard)
    const dashboardActions = permissionsGrouped['dashboard'];
    if (dashboardActions?.length) {
        result.push({
            id: 'dashboard',
            label: 'Panel de control',
            permissions: dashboardActions.map((action) => ({
                name: `dashboard.${action}`,
                label: getActionLabel(action),
            })),
        });
    }

    // 2. Mis órdenes (Mis Órdenes + Mis Vehículos + Mi Historial)
    const myOrdersActions = permissionsGrouped['my_orders'] ?? [];
    const myOrdersPerms: Array<{ name: string; label: string }> = myOrdersActions.map((action) => ({
        name: `my_orders.${action}`,
        label: getActionLabel(action),
    }));
    const myVehiclesActions = permissionsGrouped['my_vehicles'] ?? [];
    const myVehiclesPerms: Array<{ name: string; label: string }> = myVehiclesActions.map((action) => ({
        name: `my_vehicles.${action}`,
        label: getActionLabel(action),
    }));
    const myOrdersHistoryActions = permissionsGrouped['my_orders_history'] ?? [];
    const myOrdersHistoryPerms: Array<{ name: string; label: string }> = myOrdersHistoryActions.map((action) => ({
        name: `my_orders_history.${action}`,
        label: getActionLabel(action),
    }));
    const misOrdenesChildren: MenuItem[] = [];
    if (myOrdersPerms.length) misOrdenesChildren.push({ id: 'my_orders', label: 'Mis Órdenes', permissions: myOrdersPerms });
    if (myVehiclesPerms.length) misOrdenesChildren.push({ id: 'my_vehicles', label: 'Mis Vehículos', permissions: myVehiclesPerms });
    if (myOrdersHistoryPerms.length) misOrdenesChildren.push({ id: 'my_orders_history', label: 'Mi Historial', permissions: myOrdersHistoryPerms });
    if (misOrdenesChildren.length) {
        result.push({ id: 'mis_ordenes', label: 'Mis órdenes', children: misOrdenesChildren });
    }

    // 3. Usuarios (grupo con Roles y Usuarios, como en el sidebar)
    const rolesActions = permissionsGrouped['roles'] ?? [];
    const usersActions = permissionsGrouped['users'] ?? [];
    const rolesPerms: Array<{ name: string; label: string }> = rolesActions.map((action) => ({
        name: `roles.${action}`,
        label: getActionLabel(action),
    }));
    if (permissionsGrouped['permissions']?.includes('view')) {
        rolesPerms.push({ name: 'permissions.view', label: PERMISSIONS_VIEW_AS_LABEL });
    }
    const usersPerms: Array<{ name: string; label: string }> = (usersActions ?? []).map((action) => ({
        name: `users.${action}`,
        label: getActionLabel(action),
    }));
    const clientsActions = permissionsGrouped['clients'] ?? [];
    const clientsPerms: Array<{ name: string; label: string }> = clientsActions.map((action) => ({
        name: `clients.${action}`,
        label: getActionLabel(action),
    }));

    const children: MenuItem[] = [];
    if (rolesPerms.length) children.push({ id: 'roles', label: 'Roles', permissions: rolesPerms });
    if (usersPerms.length) children.push({ id: 'users', label: 'Usuarios', permissions: usersPerms });
    if (clientsPerms.length) children.push({ id: 'clients', label: 'Clientes', permissions: clientsPerms });
    if (children.length) {
        result.push({ id: 'usuarios', label: 'Usuarios', children });
    }

    // 3. Vehículos (grupo con Marca y Modelo)
    const brandsActions = permissionsGrouped['brands'] ?? [];
    const brandsPerms: Array<{ name: string; label: string }> = brandsActions.map((action) => ({
        name: `brands.${action}`,
        label: getActionLabel(action),
    }));
    const vehicleModelsActions = permissionsGrouped['vehicle_models'] ?? [];
    const vehicleModelsPerms: Array<{ name: string; label: string }> = vehicleModelsActions.map((action) => ({
        name: `vehicle_models.${action}`,
        label: getActionLabel(action),
    }));
    const vehiclesActions = permissionsGrouped['vehicles'] ?? [];
    const vehiclesPerms: Array<{ name: string; label: string }> = vehiclesActions.map((action) => ({
        name: `vehicles.${action}`,
        label: getActionLabel(action),
    }));
    const vehiculosChildren: MenuItem[] = [];
    if (brandsPerms.length) vehiculosChildren.push({ id: 'brands', label: 'Marca', permissions: brandsPerms });
    if (vehicleModelsPerms.length) vehiculosChildren.push({ id: 'vehicle_models', label: 'Modelo', permissions: vehicleModelsPerms });
    if (vehiclesPerms.length) vehiculosChildren.push({ id: 'vehicles', label: 'Vehículo', permissions: vehiclesPerms });
    if (vehiculosChildren.length) {
        result.push({ id: 'vehiculos', label: 'Vehículos', children: vehiculosChildren });
    }

    // 4. Inventario (Tipo y Producto)
    const inventoryTypesActions = permissionsGrouped['inventory_types'] ?? [];
    const inventoryTypesPerms: Array<{ name: string; label: string }> = inventoryTypesActions.map((action) => ({
        name: `inventory_types.${action}`,
        label: getActionLabel(action),
    }));
    const inventoryBrandsActions = permissionsGrouped['inventory_brands'] ?? [];
    const inventoryBrandsPerms: Array<{ name: string; label: string }> = inventoryBrandsActions.map((action) => ({
        name: `inventory_brands.${action}`,
        label: getActionLabel(action),
    }));
    const productsActions = permissionsGrouped['products'] ?? [];
    const productsPerms: Array<{ name: string; label: string }> = productsActions.map((action) => ({
        name: `products.${action}`,
        label: getActionLabel(action),
    }));
    const inventarioChildren: MenuItem[] = [];
    if (inventoryTypesPerms.length) inventarioChildren.push({ id: 'inventory_types', label: 'Tipo', permissions: inventoryTypesPerms });
    if (inventoryBrandsPerms.length) inventarioChildren.push({ id: 'inventory_brands', label: 'Marca', permissions: inventoryBrandsPerms });
    if (productsPerms.length) inventarioChildren.push({ id: 'products', label: 'Producto', permissions: productsPerms });
    if (inventarioChildren.length) {
        result.push({ id: 'inventario', label: 'Inventario', children: inventarioChildren });
    }

    // 5. Servicio (Lista de chequeo y Tipo de servicio)
    const serviceChecklistsActions = permissionsGrouped['service_checklists'] ?? [];
    const serviceChecklistsPerms: Array<{ name: string; label: string }> = serviceChecklistsActions.map((action) => ({
        name: `service_checklists.${action}`,
        label: getActionLabel(action),
    }));
    const serviceTypesActions = permissionsGrouped['service_types'] ?? [];
    const serviceTypesPerms: Array<{ name: string; label: string }> = serviceTypesActions.map((action) => ({
        name: `service_types.${action}`,
        label: getActionLabel(action),
    }));
    const workOrdersActions = permissionsGrouped['work_orders'] ?? [];
    const workOrdersPerms: Array<{ name: string; label: string }> = workOrdersActions.map((action) => ({
        name: `work_orders.${action}`,
        label: getActionLabel(action),
    }));
    const workOrderPhotosActions = permissionsGrouped['work_order_photos'] ?? [];
    const workOrderPhotosPerms: Array<{ name: string; label: string }> = workOrderPhotosActions.map((action) => ({
        name: `work_order_photos.${action}`,
        label: getActionLabel(action),
    }));
    const workOrderChecklistResultsActions = permissionsGrouped['work_order_checklist_results'] ?? [];
    const workOrderChecklistResultsPerms: Array<{ name: string; label: string }> = workOrderChecklistResultsActions.map((action) => ({
        name: `work_order_checklist_results.${action}`,
        label: getActionLabel(action),
    }));
    const workOrderDiagnosesActions = permissionsGrouped['work_order_diagnoses'] ?? [];
    const workOrderDiagnosesPerms: Array<{ name: string; label: string }> = workOrderDiagnosesActions.map((action) => ({
        name: `work_order_diagnoses.${action}`,
        label: getActionLabel(action),
    }));
    const workOrderServicesActions = permissionsGrouped['work_order_services'] ?? [];
    const workOrderServicesPerms: Array<{ name: string; label: string }> = workOrderServicesActions.map((action) => ({
        name: `work_order_services.${action}`,
        label: getActionLabel(action),
    }));
    const workOrderPaymentsActions = permissionsGrouped['work_order_payments'] ?? [];
    const workOrderPaymentsPerms: Array<{ name: string; label: string }> = workOrderPaymentsActions.map((action) => ({
        name: `work_order_payments.${action}`,
        label: getActionLabel(action),
    }));
    const workOrderTicketsActions = permissionsGrouped['work_order_tickets'] ?? [];
    const workOrderTicketsPerms: Array<{ name: string; label: string }> = workOrderTicketsActions.map((action) => ({
        name: `work_order_tickets.${action}`,
        label: getActionLabel(action),
    }));
    const servicePackagesActions = permissionsGrouped['service_packages'] ?? [];
    const servicePackagesPerms: Array<{ name: string; label: string }> = servicePackagesActions.map((action) => ({
        name: `service_packages.${action}`,
        label: getActionLabel(action),
    }));
    const servicePackageItemsActions = permissionsGrouped['service_package_items'] ?? [];
    const servicePackageItemsPerms: Array<{ name: string; label: string }> = servicePackageItemsActions.map((action) => ({
        name: `service_package_items.${action}`,
        label: getActionLabel(action),
    }));
    const accountsReceivableActions = permissionsGrouped['accounts_receivable'] ?? [];
    const accountsReceivablePerms: Array<{ name: string; label: string }> = accountsReceivableActions.map((action) => ({
        name: `accounts_receivable.${action}`,
        label: getActionLabel(action),
    }));
    const maintenanceSchedulesActions = permissionsGrouped['maintenance_schedules'] ?? [];
    const maintenanceSchedulesPerms: Array<{ name: string; label: string }> = maintenanceSchedulesActions.map((action) => ({
        name: `maintenance_schedules.${action}`,
        label: getActionLabel(action),
    }));
    const promotionsActions = permissionsGrouped['promotions'] ?? [];
    const promotionsPerms: Array<{ name: string; label: string }> = promotionsActions.map((action) => ({
        name: `promotions.${action}`,
        label: getActionLabel(action),
    }));
    const soraConversationsActions = permissionsGrouped['sora_conversations'] ?? [];
    const soraConversationsPerms: Array<{ name: string; label: string }> = soraConversationsActions.map((action) => ({
        name: `sora_conversations.${action}`,
        label: getActionLabel(action),
    }));
    const soraAppointmentsActions = permissionsGrouped['sora_appointments'] ?? [];
    const soraAppointmentsPerms: Array<{ name: string; label: string }> = soraAppointmentsActions.map((action) => ({
        name: `sora_appointments.${action}`,
        label: getActionLabel(action),
    }));
    const servicioChildren: MenuItem[] = [];
    if (serviceChecklistsPerms.length) servicioChildren.push({ id: 'service_checklists', label: 'Lista de chequeo', permissions: serviceChecklistsPerms });
    if (serviceTypesPerms.length) servicioChildren.push({ id: 'service_types', label: 'Tipo de servicio', permissions: serviceTypesPerms });
    if (servicePackagesPerms.length) servicioChildren.push({ id: 'service_packages', label: 'Paquetes de servicio', permissions: servicePackagesPerms });
    if (servicePackageItemsPerms.length) servicioChildren.push({ id: 'service_package_items', label: 'Ítems de paquetes de servicio', permissions: servicePackageItemsPerms });
    if (workOrdersPerms.length) servicioChildren.push({ id: 'work_orders', label: 'Órdenes de trabajo', permissions: workOrdersPerms });
    if (workOrderPhotosPerms.length) servicioChildren.push({ id: 'work_order_photos', label: 'Fotos de orden de trabajo', permissions: workOrderPhotosPerms });
    if (workOrderChecklistResultsPerms.length) servicioChildren.push({ id: 'work_order_checklist_results', label: 'Checklist de orden de trabajo', permissions: workOrderChecklistResultsPerms });
    if (workOrderDiagnosesPerms.length) servicioChildren.push({ id: 'work_order_diagnoses', label: 'Diagnósticos de orden de trabajo', permissions: workOrderDiagnosesPerms });
    if (workOrderServicesPerms.length) servicioChildren.push({ id: 'work_order_services', label: 'Servicios de orden de trabajo', permissions: workOrderServicesPerms });
    if (workOrderPaymentsPerms.length) servicioChildren.push({ id: 'work_order_payments', label: 'Pagos de orden de trabajo', permissions: workOrderPaymentsPerms });
    if (workOrderTicketsPerms.length) servicioChildren.push({ id: 'work_order_tickets', label: 'Tickets de orden de trabajo', permissions: workOrderTicketsPerms });
    if (accountsReceivablePerms.length) servicioChildren.push({ id: 'accounts_receivable', label: 'Cuentas por cobrar', permissions: accountsReceivablePerms });
    if (maintenanceSchedulesPerms.length) servicioChildren.push({ id: 'maintenance_schedules', label: 'Recordatorios de mantenimiento', permissions: maintenanceSchedulesPerms });
    if (servicioChildren.length) {
        result.push({ id: 'servicio', label: 'Servicio', children: servicioChildren });
    }

    // Marketing
    const marketingChildren: MenuItem[] = [];
    if (promotionsPerms.length) marketingChildren.push({ id: 'promotions', label: 'Promociones', permissions: promotionsPerms });
    if (soraConversationsPerms.length) marketingChildren.push({ id: 'sora_conversations', label: 'Conversaciones SORA', permissions: soraConversationsPerms });
    if (soraAppointmentsPerms.length) marketingChildren.push({ id: 'sora_appointments', label: 'Citas SORA', permissions: soraAppointmentsPerms });
    if (marketingChildren.length) {
        result.push({ id: 'marketing', label: 'Marketing', children: marketingChildren });
    }

    return result;
}

/** Items del sidebar para la vista previa: permiso que controla visibilidad */
const SIDEBAR_PREVIEW_ITEMS = [
    { permission: 'dashboard.view' as string | null, label: 'Panel de control', icon: LayoutGrid },
    {
        permission: null,
        label: 'Mis órdenes',
        icon: ClipboardList,
        children: [
            { permission: 'my_orders.view', label: 'Mis Órdenes', icon: ClipboardList },
            { permission: 'my_vehicles.view', label: 'Mis Vehículos', icon: ClipboardList },
            { permission: 'my_orders_history.view', label: 'Mi Historial', icon: ClipboardList },
        ],
    },
    {
        permission: null,
        label: 'Usuarios',
        icon: Users,
        children: [
            { permission: 'roles.view', label: 'Roles', icon: KeyRound },
            { permission: 'users.view', label: 'Usuarios', icon: User },
            { permission: 'clients.view', label: 'Clientes', icon: User },
        ],
    },
    {
        permission: null,
        label: 'Vehículos',
        icon: Car,
        children: [
            { permission: 'brands.view', label: 'Marca', icon: Car },
            { permission: 'vehicle_models.view', label: 'Modelo', icon: Car },
            { permission: 'vehicles.view', label: 'Vehículo', icon: Car },
        ],
    },
    {
        permission: null,
        label: 'Inventario',
        icon: LayoutGrid,
        children: [
            { permission: 'inventory_types.view', label: 'Tipo', icon: LayoutGrid },
            { permission: 'inventory_brands.view', label: 'Marca', icon: LayoutGrid },
            { permission: 'products.view', label: 'Producto', icon: LayoutGrid },
        ],
    },
    {
        permission: null,
        label: 'Servicio',
        icon: LayoutGrid,
        children: [
            { permission: 'service_checklists.view', label: 'Lista de chequeo', icon: LayoutGrid },
            { permission: 'service_types.view', label: 'Tipo de servicio', icon: LayoutGrid },
            { permission: 'service_packages.view', label: 'Paquetes de servicio', icon: LayoutGrid },
            { permission: 'service_package_items.view', label: 'Ítems de paquetes de servicio', icon: LayoutGrid },
            { permission: 'work_orders.view', label: 'Órdenes de trabajo', icon: LayoutGrid },
            { permission: 'work_orders.mark_delivered', label: 'Marcar como entregado', icon: LayoutGrid },
            { permission: 'work_orders.view_summary', label: 'Ver resumen (entregadas)', icon: LayoutGrid },
            { permission: 'work_orders.print_summary', label: 'Descargar PDF resumen', icon: LayoutGrid },
            { permission: 'work_order_photos.view', label: 'Fotos de orden de trabajo', icon: LayoutGrid },
            { permission: 'work_order_checklist_results.view', label: 'Checklist de orden de trabajo', icon: LayoutGrid },
            { permission: 'work_order_diagnoses.view', label: 'Diagnósticos de orden de trabajo', icon: LayoutGrid },
            { permission: 'work_order_services.view', label: 'Servicios de orden de trabajo', icon: LayoutGrid },
            { permission: 'work_order_payments.view', label: 'Pagos de orden de trabajo', icon: LayoutGrid },
            { permission: 'work_order_payments.resend_notification', label: 'Reenviar comprobante de pago', icon: LayoutGrid },
            { permission: 'accounts_receivable.view', label: 'Cuentas por cobrar', icon: LayoutGrid },
            { permission: 'maintenance_schedules.view', label: 'Recordatorios de mantenimiento', icon: LayoutGrid },
            { permission: 'maintenance_schedules.resend_notification', label: 'Reenviar aviso de mantenimiento', icon: LayoutGrid },
        ],
    },
    {
        permission: null,
        label: 'Marketing',
        icon: LayoutGrid,
        children: [
            { permission: 'promotions.view', label: 'Promociones', icon: LayoutGrid },
            { permission: 'sora_conversations.view', label: 'Conversaciones SORA', icon: LayoutGrid },
            { permission: 'sora_appointments.view', label: 'Citas SORA', icon: LayoutGrid },
        ],
    },
];

type AssignPermissionsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: Role | null;
    rolesBasePath: string;
    onSuccess?: () => void;
};

export function AssignPermissionsModal({
    open,
    onOpenChange,
    role,
    rolesBasePath,
    onSuccess,
}: AssignPermissionsModalProps) {
    const [permissionsGrouped, setPermissionsGrouped] = React.useState<PermissionsGrouped>({});
    const [selectedNames, setSelectedNames] = React.useState<Set<string>>(new Set());
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'permisos' | 'preview'>('permisos');
    const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

    const menuTree = React.useMemo(() => buildMenuTree(permissionsGrouped), [permissionsGrouped]);

    const fetchPermissions = React.useCallback(async () => {
        if (!role?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`${rolesBasePath}/${role.id}/permissions`, {
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = (await res.json()) as {
                permissions_grouped: PermissionsGrouped;
                role_permission_names: string[];
            };
            setPermissionsGrouped(data.permissions_grouped);
            setSelectedNames(new Set(data.role_permission_names));
        } catch {
            setPermissionsGrouped({});
            setSelectedNames(new Set());
        } finally {
            setLoading(false);
        }
    }, [role?.id, rolesBasePath]);

    React.useEffect(() => {
        if (open && role?.id) fetchPermissions();
    }, [open, role?.id, fetchPermissions]);

    const togglePermission = (fullName: string) => {
        setSelectedNames((prev) => {
            const next = new Set(prev);
            if (next.has(fullName)) next.delete(fullName);
            else next.add(fullName);
            return next;
        });
    };

    // Obtiene todos los nombres de permisos de un nodo (grupo o ítem)
    const getAllPerms = React.useCallback((node: MenuTreeNode): string[] => {
        if (isMenuGroup(node)) return node.children.flatMap((c) => c.permissions.map((p) => p.name));
        return node.permissions.map((p) => p.name);
    }, []);

    const isAllSelected = (perms: string[]) => perms.length > 0 && perms.every((p) => selectedNames.has(p));
    const isSomeSelected = (perms: string[]) => perms.some((p) => selectedNames.has(p));

    const toggleAll = (perms: string[], selectAll: boolean) => {
        setSelectedNames((prev) => {
            const next = new Set(prev);
            perms.forEach((p) => selectAll ? next.add(p) : next.delete(p));
            return next;
        });
    };

    const toggleExpanded = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSave = async () => {
        if (!role?.id) return;
        setSaving(true);
        try {
            const token = getCookie('XSRF-TOKEN');
            const res = await fetch(`${rolesBasePath}/${role.id}/permissions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(token ? { 'X-XSRF-TOKEN': token } : {}),
                },
                body: JSON.stringify({ permissions: Array.from(selectedNames) }),
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error('Failed to save');
            onSuccess?.();
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    const showInPreview = (permission: string | null) =>
        permission === null || selectedNames.has(permission);

    if (!role) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-2xl sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        Permisos del rol «{role.name}»
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Asigna permisos por módulo y revisa la vista previa del menú.
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />

                {loading ? (
                    <div className="flex min-h-[220px] items-center justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Tabs: Permisos | Vista previa */}
                        <div className="flex gap-1 rounded-lg border border-content-border bg-content-muted/30 p-1">
                            <button
                                type="button"
                                onClick={() => setActiveTab('permisos')}
                                className={cn(
                                    'cursor-pointer flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                                    activeTab === 'permisos'
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                Permisos
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('preview')}
                                className={cn(
                                    'cursor-pointer flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                                    activeTab === 'preview'
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                Vista previa
                            </button>
                        </div>

                        {activeTab === 'permisos' && (
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                    Plataforma
                                </p>
                                {menuTree.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                        No hay permisos configurados.
                                    </p>
                                ) : (
                                    <div className="max-h-[min(50vh,360px)] overflow-y-auto rounded-md border border-content-border">
                                        {menuTree.map((node) => {
                                            const nodePerms = getAllPerms(node);
                                            const allChk  = isAllSelected(nodePerms);
                                            const someChk = !allChk && isSomeSelected(nodePerms);
                                            const isOpen  = expanded.has(node.id);

                                            if (isMenuGroup(node)) {
                                                return (
                                                    <Collapsible key={node.id} open={isOpen} onOpenChange={() => toggleExpanded(node.id)}>
                                                        {/* Cabecera del grupo */}
                                                        <div className="flex items-center gap-2 border-b border-content-border bg-content-muted/30 px-3 py-2.5 last:border-b-0">
                                                            <CollapsibleTrigger asChild>
                                                                <button type="button" className="flex flex-1 cursor-pointer items-center gap-2 text-left text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors">
                                                                    <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-200', !isOpen && '-rotate-90')} />
                                                                    <Users className="size-4 shrink-0 text-muted-foreground" />
                                                                    {node.label}
                                                                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                                                                        ({nodePerms.filter(p => selectedNames.has(p)).length}/{nodePerms.length})
                                                                    </span>
                                                                </button>
                                                            </CollapsibleTrigger>
                                                            {/* Checkbox "Marcar todo" del grupo */}
                                                            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground shrink-0 select-none"
                                                                onClick={(e) => e.stopPropagation()}>
                                                                <Checkbox
                                                                    checked={allChk ? true : someChk ? 'indeterminate' : false}
                                                                    onCheckedChange={(v) => toggleAll(nodePerms, !!v)}
                                                                    className="size-3.5 rounded-[3px]"
                                                                />
                                                                Todo
                                                            </label>
                                                        </div>

                                                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                                            <div className="bg-card/20">
                                                                {node.children.map((child) => {
                                                                    const childPerms = child.permissions.map(p => p.name);
                                                                    const childAll  = isAllSelected(childPerms);
                                                                    const childSome = !childAll && isSomeSelected(childPerms);
                                                                    const childOpen = expanded.has(child.id);
                                                                    return (
                                                                        <Collapsible key={child.id} open={childOpen} onOpenChange={() => toggleExpanded(child.id)}>
                                                                            <div className="flex items-center gap-2 border-b border-content-border/50 bg-card/40 py-2 pl-6 pr-3 last:border-b-0">
                                                                                <CollapsibleTrigger asChild>
                                                                                    <button type="button" className="flex flex-1 cursor-pointer items-center gap-2 text-left text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
                                                                                        <ChevronDown className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform duration-200', !childOpen && '-rotate-90')} />
                                                                                        <KeyRound className="size-3.5 shrink-0 text-muted-foreground" />
                                                                                        {child.label}
                                                                                        <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                                                                                            ({childPerms.filter(p => selectedNames.has(p)).length}/{childPerms.length})
                                                                                        </span>
                                                                                    </button>
                                                                                </CollapsibleTrigger>
                                                                                <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground shrink-0 select-none"
                                                                                    onClick={(e) => e.stopPropagation()}>
                                                                                    <Checkbox
                                                                                        checked={childAll ? true : childSome ? 'indeterminate' : false}
                                                                                        onCheckedChange={(v) => toggleAll(childPerms, !!v)}
                                                                                        className="size-3.5 rounded-[3px]"
                                                                                    />
                                                                                    Todo
                                                                                </label>
                                                                            </div>
                                                                            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                                                                <ul className="border-b border-content-border/40 bg-card/50">
                                                                                    {child.permissions.map((perm) => (
                                                                                        <PermissionRow key={perm.name} perm={perm}
                                                                                            checked={selectedNames.has(perm.name)}
                                                                                            onToggle={() => togglePermission(perm.name)} />
                                                                                    ))}
                                                                                </ul>
                                                                            </CollapsibleContent>
                                                                        </Collapsible>
                                                                    );
                                                                })}
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                );
                                            }

                                            // MenuItem directo (ej. Panel de control)
                                            return (
                                                <Collapsible key={node.id} open={isOpen} onOpenChange={() => toggleExpanded(node.id)}>
                                                    <div className="flex items-center gap-2 border-b border-content-border bg-content-muted/30 px-3 py-2.5 last:border-b-0">
                                                        <CollapsibleTrigger asChild>
                                                            <button type="button" className="flex flex-1 cursor-pointer items-center gap-2 text-left text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors">
                                                                <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-200', !isOpen && '-rotate-90')} />
                                                                <LayoutGrid className="size-4 shrink-0 text-muted-foreground" />
                                                                {node.label}
                                                                <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                                                                    ({nodePerms.filter(p => selectedNames.has(p)).length}/{nodePerms.length})
                                                                </span>
                                                            </button>
                                                        </CollapsibleTrigger>
                                                        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground shrink-0 select-none"
                                                            onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                checked={allChk ? true : someChk ? 'indeterminate' : false}
                                                                onCheckedChange={(v) => toggleAll(nodePerms, !!v)}
                                                                className="size-3.5 rounded-[3px]"
                                                            />
                                                            Todo
                                                        </label>
                                                    </div>
                                                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                                        <ul className="border-b border-content-border bg-card/50">
                                                            {node.permissions.map((perm) => (
                                                                <PermissionRow key={perm.name} perm={perm}
                                                                    checked={selectedNames.has(perm.name)}
                                                                    onToggle={() => togglePermission(perm.name)} />
                                                            ))}
                                                        </ul>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'preview' && (
                            <div className="space-y-2">
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                    Cómo verá el menú este rol
                                </p>
                                <div className="flex justify-center rounded-lg border border-content-border bg-content-muted/20 p-4">
                                    <div className="max-h-[min(55vh,380px)] min-w-[280px] w-[320px] shrink-0 overflow-y-auto rounded-lg border border-content-border bg-card py-2 shadow-sm">
                                        <nav className="space-y-0.5 px-2">
                                            {SIDEBAR_PREVIEW_ITEMS.map((row) => {
                                                if (row.children) {
                                                    const parentVisible = row.children.some((c) =>
                                                        showInPreview(c.permission),
                                                    );
                                                    if (!parentVisible) return null;
                                                    return (
                                                        <div key={row.label} className="space-y-0.5">
                                                            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground">
                                                                <row.icon className="size-4 shrink-0" />
                                                                <span className="wrap-break-word text-xs font-medium text-foreground">
                                                                    {row.label}
                                                                </span>
                                                            </div>
                                                            <div className="ml-3 space-y-0.5 border-l border-content-border pl-2">
                                                                {row.children.map((sub) => {
                                                                    if (!showInPreview(sub.permission))
                                                                        return null;
                                                                    return (
                                                                        <div
                                                                            key={sub.label}
                                                                            className="flex items-center gap-2 rounded-md py-1 text-muted-foreground"
                                                                        >
                                                                            <sub.icon className="size-3.5 shrink-0" />
                                                                            <span className="wrap-break-word text-xs text-foreground">
                                                                                {sub.label}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                if (!showInPreview(row.permission)) return null;
                                                return (
                                                    <div
                                                        key={row.label}
                                                        className="flex items-center gap-2 rounded-md px-2 py-1.5"
                                                    >
                                                        <row.icon className="size-4 shrink-0 text-muted-foreground" />
                                                        <span className="wrap-break-word text-xs font-medium text-foreground">
                                                            {row.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex flex-wrap gap-2 sm:justify-end sm:gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={saving}
                                className="cursor-pointer border-content-border min-w-0 flex-1 sm:flex-none"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="cursor-pointer min-w-0 flex-1 sm:flex-none"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Guardando…
                                    </>
                                ) : (
                                    'Guardar permisos'
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
