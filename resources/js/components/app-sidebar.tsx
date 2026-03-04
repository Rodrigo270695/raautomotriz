import { Link, usePage } from '@inertiajs/react';
import { Car, ClipboardList, LayoutGrid, Megaphone, Package, Users, Wrench } from 'lucide-react';
import { useMemo } from 'react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

import { index as dashboardRoute } from '@/routes/dashboard';

/** Permisos que controlan cada ítem del menú (igual que AssignPermissionsModal) */
const DASHBOARD_PERMISSION = 'dashboard.view';
const ROLES_PERMISSION = 'roles.view';
const USERS_PERMISSION = 'users.view';
const CLIENTS_PERMISSION = 'clients.view';
const BRANDS_PERMISSION = 'brands.view';
const VEHICLES_PERMISSION = 'vehicles.view';
const INVENTORY_TYPES_PERMISSION = 'inventory_types.view';
const PRODUCTS_PERMISSION = 'products.view';
const SERVICE_CHECKLISTS_PERMISSION = 'service_checklists.view';
const SERVICE_TYPES_PERMISSION = 'service_types.view';
const SERVICE_PACKAGES_PERMISSION = 'service_packages.view';
const WORK_ORDERS_PERMISSION = 'work_orders.view';
const ACCOUNTS_RECEIVABLE_PERMISSION = 'accounts_receivable.view';
const MAINTENANCE_SCHEDULES_PERMISSION = 'maintenance_schedules.view';
const PROMOTIONS_PERMISSION = 'promotions.view';
const SORA_CONVERSATIONS_PERMISSION = 'sora_conversations.view';
const SORA_APPOINTMENTS_PERMISSION = 'sora_appointments.view';
const MY_ORDERS_PERMISSION = 'my_orders.view';
const MY_VEHICLES_PERMISSION = 'my_vehicles.view';
const MY_ORDERS_HISTORY_PERMISSION = 'my_orders_history.view';

const ALL_MAIN_NAV_ITEMS: NavItem[] = [
    {
        title: 'Panel de control',
        href: dashboardRoute().url,
        icon: LayoutGrid,
        permission: DASHBOARD_PERMISSION,
    },
    {
        title: 'Mis órdenes',
        href: '#',
        icon: ClipboardList,
        permission: null,
        items: [
            { title: 'Mis Órdenes', href: '/dashboard/my-orders', permission: MY_ORDERS_PERMISSION },
            { title: 'Mis Vehículos', href: '/dashboard/my-vehicles', permission: MY_VEHICLES_PERMISSION },
            { title: 'Mi Historial', href: '/dashboard/my-orders/history', permission: MY_ORDERS_HISTORY_PERMISSION },
        ],
    },
    {
        title: 'Usuarios',
        href: '#',
        icon: Users,
        permission: null,
        items: [
            { title: 'Roles', href: '/dashboard/users/roles', permission: ROLES_PERMISSION },
            { title: 'Usuarios', href: '/dashboard/users', permission: USERS_PERMISSION },
            { title: 'Clientes', href: '/dashboard/users/clients', permission: CLIENTS_PERMISSION },
        ],
    },
    {
        title: 'Vehículos',
        href: '#',
        icon: Car,
        permission: null,
        items: [
            { title: 'Marca', href: '/dashboard/vehicles/brands', permission: BRANDS_PERMISSION },
            { title: 'Vehículo', href: '/dashboard/vehicles/vehicles', permission: VEHICLES_PERMISSION },
        ],
    },
    {
        title: 'Inventario',
        href: '#',
        icon: Package,
        permission: null,
        items: [
            { title: 'Tipo', href: '/dashboard/inventory/types', permission: INVENTORY_TYPES_PERMISSION },
            { title: 'Producto', href: '/dashboard/inventory/products', permission: PRODUCTS_PERMISSION },
        ],
    },
    {
        title: 'Servicio',
        href: '#',
        icon: Wrench,
        permission: null,
        items: [
            { title: 'Lista de chequeo', href: '/dashboard/services/checklists', permission: SERVICE_CHECKLISTS_PERMISSION },
            { title: 'Tipo de servicio', href: '/dashboard/services/types', permission: SERVICE_TYPES_PERMISSION },
            { title: 'Paquetes de servicio', href: '/dashboard/services/packages', permission: SERVICE_PACKAGES_PERMISSION },
            { title: 'Órdenes de trabajo', href: '/dashboard/services/work-orders', permission: WORK_ORDERS_PERMISSION },
            { title: 'Cuentas por cobrar', href: '/dashboard/services/accounts-receivable', permission: ACCOUNTS_RECEIVABLE_PERMISSION },
            { title: 'Recordatorios de mantenimiento', href: '/dashboard/services/maintenance-schedules', permission: MAINTENANCE_SCHEDULES_PERMISSION },
        ],
    },
    {
        title: 'Marketing',
        href: '#',
        icon: Megaphone,
        permission: null,
        items: [
            { title: 'Promociones', href: '/dashboard/marketing/promotions', permission: PROMOTIONS_PERMISSION },
            { title: 'Conversaciones SORA', href: '/dashboard/marketing/sora-conversations', permission: SORA_CONVERSATIONS_PERMISSION },
            { title: 'Citas SORA', href: '/dashboard/marketing/sora-appointments', permission: SORA_APPOINTMENTS_PERMISSION },
        ],
    },
];

function hasPermission(permissions: string[], permission: string | null): boolean {
    if (permission == null) return true;
    return permissions.includes(permission);
}

/** Filtra ítems del menú según permisos: no se muestra ítem ni grupo si no tiene permiso; el grupo "Usuarios" solo se muestra si hay al menos un sub-ítem visible. */
function buildMainNavItems(permissions: string[]): NavItem[] {
    const result: NavItem[] = [];

    for (const item of ALL_MAIN_NAV_ITEMS) {
        if (item.items?.length) {
            const visibleSubItems = item.items.filter((sub) =>
                hasPermission(permissions, sub.permission ?? null),
            );
            if (visibleSubItems.length === 0) continue;
            result.push({
                title: item.title,
                href: item.href,
                icon: item.icon,
                items: visibleSubItems.map(({ title, href }) => ({ title, href })),
            });
        } else {
            if (!hasPermission(permissions, item.permission ?? null)) continue;
            result.push({
                title: item.title,
                href: item.href,
                icon: item.icon,
            });
        }
    }

    return result;
}

export function AppSidebar() {
    const { auth } = usePage().props as { auth: { permissions: string[] } };
    const permissions = auth?.permissions ?? [];
    const mainNavItems = useMemo(() => buildMainNavItems(permissions), [permissions]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardRoute().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
