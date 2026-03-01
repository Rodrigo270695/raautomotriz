import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Usuarios', href: '/dashboard/usuarios' },
];

export default function UsuariosIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <h1 className="font-semibold text-foreground text-xl tracking-tight">Usuarios</h1>
                <p className="text-muted-foreground text-sm">
                    Gestión de usuarios. Contenido por implementar.
                </p>
            </div>
        </AppLayout>
    );
}
