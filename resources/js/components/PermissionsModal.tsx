import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { KeyRound, Lock, Shield } from 'lucide-react';

export type PermissionsGrouped = Record<string, string[]>;

const resourceLabels: Record<string, string> = {
    roles: 'Roles',
    users: 'Usuarios',
    permissions: 'Permisos',
    service_packages: 'Paquetes de servicio',
    service_package_items: 'Ítems de paquetes de servicio',
    work_order_services: 'Servicios de orden de trabajo',
    work_order_payments: 'Pagos de orden de trabajo',
    work_order_tickets: 'Tickets de orden de trabajo',
};

const actionLabels: Record<string, string> = {
    view: 'Ver',
    create: 'Crear',
    update: 'Editar',
    delete: 'Eliminar',
    view_audit: 'Ver creado/modificado',
    print_ticket: 'Imprimir ticket de pago',
    print: 'Imprimir ticket de orden',
};

function getResourceLabel(resource: string): string {
    return resourceLabels[resource] ?? resource.charAt(0).toUpperCase() + resource.slice(1);
}

function getActionLabel(action: string): string {
    return actionLabels[action] ?? action;
}

type PermissionsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permissionsGrouped: PermissionsGrouped;
};

export function PermissionsModal({
    open,
    onOpenChange,
    permissionsGrouped,
}: PermissionsModalProps) {
    const resources = Object.keys(permissionsGrouped).sort();
    const [activeResource, setActiveResource] = React.useState<string>(resources[0] ?? '');

    React.useEffect(() => {
        if (open && resources.length > 0 && !resources.includes(activeResource)) {
            setActiveResource(resources[0]);
        }
    }, [open, resources, activeResource]);

    const actions = activeResource ? (permissionsGrouped[activeResource] ?? []) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'border-content-border bg-card w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden p-0 shadow-2xl',
                    'backdrop-blur-sm dark:bg-card/95',
                )}
            >
                <div className="relative">
                    {/* Header con gradiente sutil */}
                    <div className="border-b border-content-border bg-linear-to-br from-slate-50/80 to-slate-100/50 px-6 py-5 dark:from-slate-900/50 dark:to-slate-800/30">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                                    <Shield className="size-6 text-primary" />
                                </div>
                                <div>
                                    <DialogTitle className="text-foreground text-xl tracking-tight">
                                        Permisos del sistema
                                    </DialogTitle>
                                    <DialogDescription className="mt-0.5 text-muted-foreground text-sm">
                                        Recursos y acciones disponibles. Organizados por módulo.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    {/* Tabs: pills horizontales */}
                    <div className="border-b border-content-border bg-content-muted/30 px-4 dark:bg-content-muted/20">
                        <div className="flex gap-1 overflow-x-auto py-3 scrollbar-thin">
                            {resources.map((resource) => (
                                <button
                                    key={resource}
                                    type="button"
                                    onClick={() => setActiveResource(resource)}
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                                        activeResource === resource
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:bg-content-muted/60 hover:text-foreground',
                                    )}
                                >
                                    <KeyRound className="size-4 shrink-0 opacity-80" />
                                    {getResourceLabel(resource)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contenido: lista de permisos del recurso activo */}
                    <div className="max-h-[min(60vh,400px)] overflow-y-auto p-6">
                        {actions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                                <Lock className="size-10 text-muted-foreground/50" />
                                <p className="text-muted-foreground text-sm">
                                    No hay permisos definidos para este recurso.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                                    Acciones
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {actions.map((action) => (
                                        <span
                                            key={action}
                                            className={cn(
                                                'inline-flex items-center rounded-lg border px-3 py-1.5 text-sm',
                                                'border-slate-200 bg-slate-50 text-slate-700',
                                                'dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200',
                                            )}
                                        >
                                            {getActionLabel(action)}
                                        </span>
                                    ))}
                                </div>
                                <p className="pt-2 text-muted-foreground text-xs">
                                    Permisos: {getResourceLabel(activeResource).toLowerCase()}.*
                                    ({actions.join(', ')})
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
