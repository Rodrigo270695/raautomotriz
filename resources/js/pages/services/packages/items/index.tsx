import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Inbox, Package, Plus, Tag } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, ServicePackageItem } from '@/types';
import { DataTable } from '@/components/data-table';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import { ActionButtons } from '@/components/actions';
import { Button } from '@/components/ui/button';
import { ServicePackageItemFormModal } from '@/components/ServicePackageItemFormModal';

type ServicePackageItemIndexProps = {
    servicePackage: {
        id: number;
        name: string;
        status: string;
        service_type_name?: string | null;
    };
    items: ServicePackageItem[];
    productsForSelect: Array<{ id: number; name: string; brand_name?: string | null; sale_price: number; purchase_price?: number | null }>;
    packagesIndexPath: string;
    can: {
        view: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
    };
};

const getBreadcrumbs = (packagesPath: string, pkgName: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Servicio', href: '#' },
    { title: 'Paquetes de servicio', href: packagesPath },
    { title: pkgName, href: '#' },
];

export default function ServicePackageItemsIndex({
    servicePackage,
    items,
    productsForSelect,
    packagesIndexPath,
    can,
}: ServicePackageItemIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ServicePackageItem | null>(null);

    const openCreate = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const openEdit = (item: ServicePackageItem) => {
        setEditingItem(item);
        setFormOpen(true);
    };

    const closeForm = (open: boolean) => {
        if (!open) setEditingItem(null);
        setFormOpen(open);
    };

    const itemsBasePath = `/dashboard/services/packages/${servicePackage.id}/items`;

    const productOptions = productsForSelect.map((p) => ({
        value: p.id,
        label: p.brand_name ? `${p.brand_name} – ${p.name}` : p.name,
        sale_price: p.sale_price,
        purchase_price: p.purchase_price ?? null,
    }));

    const columns = [
        {
            key: 'product',
            label: 'Producto',
            render: (i: ServicePackageItem) => (
                <span className="text-foreground text-sm">
                    {i.product_name
                        ? i.product_brand_name
                            ? `${i.product_brand_name} – ${i.product_name}`
                            : i.product_name
                        : '—'}
                </span>
            ),
        },
        {
            key: 'quantity',
            label: 'Cantidad',
            render: (i: ServicePackageItem) => (
                <span className="text-muted-foreground text-sm tabular-nums">{i.quantity}</span>
            ),
        },
        {
            key: 'unit_price',
            label: 'P. unitario',
            render: (i: ServicePackageItem) => (
                <span className="text-muted-foreground text-sm tabular-nums">
                    S/ {Number(i.unit_price).toFixed(2)}
                </span>
            ),
        },
        {
            key: 'subtotal',
            label: 'Subtotal',
            render: (i: ServicePackageItem) => (
                <span className="text-foreground text-sm tabular-nums">
                    S/ {(Number(i.unit_price) * Number(i.quantity)).toFixed(2)}
                </span>
            ),
        },
        {
            key: 'notes',
            label: 'Notas',
            render: (i: ServicePackageItem) => (
                <span className="text-muted-foreground text-sm line-clamp-1 max-w-[220px]">
                    {i.notes || '—'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[140px] text-right',
            render: (i: ServicePackageItem) => (
                <ActionButtons
                    canEdit={can.update}
                    canDelete={can.delete}
                    onEdit={() => openEdit(i)}
                    deleteUrl={can.delete ? `${itemsBasePath}/${i.id}` : undefined}
                />
            ),
        },
    ];

    const breadcrumbs = getBreadcrumbs(packagesIndexPath, servicePackage.name);

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-4">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">
                Este paquete aún no tiene ítems.
            </span>
            {can.create && (
                <Button size="sm" onClick={openCreate} className="cursor-pointer mt-1">
                    <Plus className="size-4 mr-1" />
                    Agregar primer ítem
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ítems · ${servicePackage.name}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col gap-2">
                    <Link
                        href={packagesIndexPath}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Volver a paquetes
                    </Link>
                    <h1 className="relative inline-block font-semibold text-foreground text-xl tracking-tight pb-1">
                        Ítems del paquete
                        <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Paquete:{' '}
                        <span className="font-medium text-foreground">{servicePackage.name}</span>
                        {servicePackage.service_type_name && (
                            <>
                                {' '}
                                ·{' '}
                                <span className="text-muted-foreground">
                                    {servicePackage.service_type_name}
                                </span>
                            </>
                        )}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Package className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Ítems</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {items.length}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <Tag className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Paquete</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {servicePackage.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                    </span>
                    {can.create && (
                        <Button
                            onClick={openCreate}
                            className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700 ml-auto"
                        >
                            <Plus className="size-4" />
                            Agregar ítem
                        </Button>
                    )}
                </div>

                <div className="border-t border-content-border pt-4" />

                <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<ServicePackageItem>
                            columns={columns}
                            data={items}
                            keyExtractor={(i) => i.id}
                            emptyMessage="Este paquete aún no tiene ítems."
                            emptyContent={emptyContent}
                            embedded
                            striped
                        />
                    </div>
                    <div className="block md:hidden">
                        {items.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {items.map((i) => (
                                    <li key={i.id}>
                                        <DataTableCard
                                            title={
                                                i.product_name
                                                    ? i.product_brand_name
                                                        ? `${i.product_brand_name} – ${i.product_name}`
                                                        : i.product_name
                                                    : 'Ítem sin producto'
                                            }
                                            actions={
                                                can.update || can.delete ? (
                                                    <ActionButtons
                                                        showLabels
                                                        canEdit={can.update}
                                                        canDelete={can.delete}
                                                        onEdit={() => openEdit(i)}
                                                        deleteUrl={
                                                            can.delete
                                                                ? `${itemsBasePath}/${i.id}`
                                                                : undefined
                                                        }
                                                    />
                                                ) : undefined
                                            }
                                            fields={[
                                                {
                                                    label: 'Tipo',
                                                    value: i.type === 'service' ? 'Servicio' : 'Producto',
                                                },
                                                {
                                                    label: 'Cantidad',
                                                    value: String(i.quantity),
                                                },
                                                {
                                                    label: 'P. unitario',
                                                    value: `S/ ${Number(i.unit_price).toFixed(2)}`,
                                                },
                                                {
                                                    label: 'Subtotal',
                                                    value: `S/ ${(Number(i.unit_price) * Number(i.quantity)).toFixed(2)}`,
                                                },
                                                {
                                                    label: 'Notas',
                                                    value: i.notes || '—',
                                                },
                                            ]}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <ServicePackageItemFormModal
                open={formOpen}
                onOpenChange={closeForm}
                item={editingItem}
                itemsBasePath={itemsBasePath}
                productsForSelect={productOptions}
            />
        </AppLayout>
    );
}

