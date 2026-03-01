import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: string;
};

export type NavSubItem = {
    title: string;
    href: string;
    /** Permiso requerido para mostrar el ítem (ej. roles.view) */
    permission?: string | null;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    /** Permiso requerido para mostrar el ítem (null = grupo; se muestra si hay al menos un sub-ítem visible) */
    permission?: string | null;
    /** Sub-items para menú desplegable (ej. Usuarios → Roles, Usuarios) */
    items?: NavSubItem[];
};
