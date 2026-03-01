import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Tag, Inbox } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, InventoryType, InventoryBrand } from '@/types';
import { ActionButtons } from '@/components/actions';
import { Button } from '@/components/ui/button';
import { InventoryTypeFormModal } from '@/components/InventoryTypeFormModal';
import { InventoryBrandFormModal } from '@/components/InventoryBrandFormModal';
import { DeleteInventoryTypeDialog } from '@/components/DeleteInventoryTypeDialog';
import { DeleteInventoryBrandDialog } from '@/components/DeleteInventoryBrandDialog';

const getBreadcrumbs = (typesIndexPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Inventario', href: '#' },
    { title: 'Tipo', href: typesIndexPath },
];

type TypesIndexProps = {
    types: InventoryType[];
    inventoryBrands: InventoryBrand[];
    typesIndexPath: string;
    can: {
        create_type: boolean;
        update_type: boolean;
        delete_type: boolean;
        create_brand: boolean;
        update_brand: boolean;
        delete_brand: boolean;
    };
};

export default function InventoryTypesIndex({
    types,
    inventoryBrands,
    typesIndexPath,
    can,
}: TypesIndexProps) {
    const [typeFormOpen, setTypeFormOpen] = useState(false);
    const [editingType, setEditingType] = useState<InventoryType | null>(null);
    const [deleteType, setDeleteType] = useState<InventoryType | null>(null);
    const [brandFormOpen, setBrandFormOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<InventoryBrand | null>(null);
    const [deleteBrand, setDeleteBrand] = useState<InventoryBrand | null>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const brandsForSelectedType =
        selectedTypeId != null
            ? inventoryBrands.filter((b) => b.inventory_type_id === selectedTypeId)
            : [];

    const openCreateType = () => {
        setEditingType(null);
        setTypeFormOpen(true);
    };
    const openEditType = (type: InventoryType) => {
        setEditingType(type);
        setTypeFormOpen(true);
    };
    const closeTypeForm = (open: boolean) => {
        if (!open) setEditingType(null);
        setTypeFormOpen(open);
    };

    const openCreateBrand = () => {
        setEditingBrand(null);
        setBrandFormOpen(true);
    };
    const openEditBrand = (brand: InventoryBrand) => {
        setEditingBrand(brand);
        setBrandFormOpen(true);
    };
    const closeBrandForm = (open: boolean) => {
        if (!open) setEditingBrand(null);
        setBrandFormOpen(open);
    };

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(typesIndexPath)}>
            <Head title="Inventario - Tipo" />

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
                            Tipo
                            <span
                                className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary"
                                aria-hidden
                            />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de tipos y marcas de inventario.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Tag className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Tipos</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {types.length}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <LayoutGrid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Marcas</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {inventoryBrands.length}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <LayoutGrid className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {types.length + inventoryBrands.length}
                        </span>
                    </span>
                </div>

                <div className="border-t border-content-border pt-4" />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Panel Tipos */}
                    <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <div className="border-b border-content-border p-3 sm:p-4 flex items-center justify-between gap-2">
                            <h2 className="font-semibold text-foreground text-base">Tipos</h2>
                            {can.create_type && (
                                <Button
                                    size="sm"
                                    onClick={openCreateType}
                                    className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                                >
                                    <Plus className="size-4" />
                                    Nuevo tipo
                                </Button>
                            )}
                        </div>
                        <div className="p-3 sm:p-4">
                            {types.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-8">
                                    <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
                                    <span className="text-muted-foreground text-sm">
                                        No hay tipos.
                                    </span>
                                    {can.create_type && (
                                        <Button
                                            size="sm"
                                            onClick={openCreateType}
                                            className="cursor-pointer mt-1"
                                        >
                                            <Plus className="size-4 mr-1" />
                                            Crear primer tipo
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-1 max-h-[min(420px,55vh)] overflow-y-auto pr-1">
                                    {types.map((type) => (
                                        <li
                                            key={type.id}
                                            role="button"
                                            tabIndex={0}
                                            className={`flex items-center justify-between gap-2 rounded-md border border-content-border/50 py-2 px-2.5 transition-colors shrink-0 cursor-pointer ${
                                                selectedTypeId === type.id
                                                    ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                                                    : 'hover:bg-content-muted/30'
                                            }`}
                                            onClick={() =>
                                                setSelectedTypeId((prev) =>
                                                    prev === type.id ? null : type.id,
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setSelectedTypeId((prev) =>
                                                        prev === type.id ? null : type.id,
                                                    );
                                                }
                                            }}
                                        >
                                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                                <span className="font-medium text-foreground text-sm truncate">
                                                    {type.name}
                                                </span>
                                                <span
                                                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                                                        type.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                            : 'bg-content-muted/60 text-muted-foreground'
                                                    }`}
                                                >
                                                    {type.status === 'active'
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </div>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <ActionButtons
                                                    canEdit={can.update_type}
                                                    canDelete={can.delete_type}
                                                    canAssignPermissions={false}
                                                    onEdit={() => openEditType(type)}
                                                    onDelete={() => setDeleteType(type)}
                                                    deleteUrl={
                                                        can.delete_type
                                                            ? `${typesIndexPath}/${type.id}`
                                                            : undefined
                                                    }
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Panel Marcas */}
                    <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <div className="border-b border-content-border p-3 sm:p-4 flex items-center justify-between gap-2">
                            <h2 className="font-semibold text-foreground text-base">
                                Marcas
                                {selectedTypeId != null && (
                                    <span className="text-muted-foreground font-normal text-sm ml-1">
                                        ({types.find((t) => t.id === selectedTypeId)?.name})
                                    </span>
                                )}
                            </h2>
                            {can.create_brand && selectedTypeId != null && (
                                <Button
                                    size="sm"
                                    onClick={openCreateBrand}
                                    className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                                >
                                    <Plus className="size-4" />
                                    Nueva marca
                                </Button>
                            )}
                        </div>
                        <div className="p-3 sm:p-4">
                            {selectedTypeId == null ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-8">
                                    <LayoutGrid
                                        className="size-10 text-muted-foreground/60"
                                        aria-hidden
                                    />
                                    <span className="text-muted-foreground text-sm text-center">
                                        Seleccione un tipo para ver sus marcas.
                                    </span>
                                </div>
                            ) : brandsForSelectedType.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-8">
                                    <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
                                    <span className="text-muted-foreground text-sm">
                                        No hay marcas en este tipo.
                                    </span>
                                    {can.create_brand && (
                                        <Button
                                            size="sm"
                                            onClick={openCreateBrand}
                                            className="cursor-pointer mt-1"
                                        >
                                            <Plus className="size-4 mr-1" />
                                            Crear primera marca
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-1 max-h-[min(420px,55vh)] overflow-y-auto pr-1">
                                    {brandsForSelectedType.map((brand) => (
                                        <li
                                            key={brand.id}
                                            className="flex items-center justify-between gap-2 rounded-md border border-content-border/50 py-2 px-2.5 hover:bg-content-muted/30 transition-colors shrink-0"
                                        >
                                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                                <span className="font-medium text-foreground text-sm truncate">
                                                    {brand.name}
                                                </span>
                                                <span
                                                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                                                        brand.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                            : 'bg-content-muted/60 text-muted-foreground'
                                                    }`}
                                                >
                                                    {brand.status === 'active'
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </div>
                                            <ActionButtons
                                                canEdit={can.update_brand}
                                                canDelete={can.delete_brand}
                                                canAssignPermissions={false}
                                                onEdit={() => openEditBrand(brand)}
                                                onDelete={() => setDeleteBrand(brand)}
                                                deleteUrl={
                                                    can.delete_brand
                                                        ? `${typesIndexPath.replace(/\/types$/, '')}/brands/${brand.id}`
                                                        : undefined
                                                }
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <InventoryTypeFormModal
                open={typeFormOpen}
                onOpenChange={closeTypeForm}
                type={editingType}
                typesIndexPath={typesIndexPath}
            />
            <InventoryBrandFormModal
                open={brandFormOpen}
                onOpenChange={closeBrandForm}
                inventoryBrand={editingBrand}
                selectedTypeId={selectedTypeId}
                typesIndexPath={typesIndexPath}
            />
            <DeleteInventoryTypeDialog
                open={Boolean(deleteType)}
                onOpenChange={(open) => !open && setDeleteType(null)}
                type={deleteType}
                typesIndexPath={typesIndexPath}
            />
            <DeleteInventoryBrandDialog
                open={Boolean(deleteBrand)}
                onOpenChange={(open) => !open && setDeleteBrand(null)}
                inventoryBrand={deleteBrand}
                typesIndexPath={typesIndexPath}
            />
        </AppLayout>
    );
}
