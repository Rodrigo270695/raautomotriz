import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Car, LayoutGrid, Plus, Tag, Inbox } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Brand, VehicleModel } from '@/types';
import { ActionButtons } from '@/components/actions';
import { Button } from '@/components/ui/button';
import { BrandFormModal } from '@/components/BrandFormModal';
import { VehicleModelFormModal } from '@/components/VehicleModelFormModal';
import { DeleteBrandDialog } from '@/components/DeleteBrandDialog';
import { DeleteVehicleModelDialog } from '@/components/DeleteVehicleModelDialog';

const getBreadcrumbs = (brandsIndexPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Marca', href: brandsIndexPath },
];

type BrandsIndexProps = {
    brands: Brand[];
    vehicleModels: VehicleModel[];
    brandsIndexPath: string;
    can: {
        create_brand: boolean;
        update_brand: boolean;
        delete_brand: boolean;
        create_vehicle_model: boolean;
        update_vehicle_model: boolean;
        delete_vehicle_model: boolean;
    };
};

export default function BrandsIndex({
    brands,
    vehicleModels,
    brandsIndexPath,
    can,
}: BrandsIndexProps) {
    const [brandFormOpen, setBrandFormOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
    const [modelFormOpen, setModelFormOpen] = useState(false);
    const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);
    const [deleteModel, setDeleteModel] = useState<VehicleModel | null>(null);
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const modelsForSelectedBrand =
        selectedBrandId != null
            ? vehicleModels.filter((m) => m.brand_id === selectedBrandId)
            : [];

    const openCreateBrand = () => {
        setEditingBrand(null);
        setBrandFormOpen(true);
    };
    const openEditBrand = (brand: Brand) => {
        setEditingBrand(brand);
        setBrandFormOpen(true);
    };
    const closeBrandForm = (open: boolean) => {
        if (!open) setEditingBrand(null);
        setBrandFormOpen(open);
    };

    const openCreateModel = () => {
        setEditingModel(null);
        setModelFormOpen(true);
    };
    const openEditModel = (model: VehicleModel) => {
        setEditingModel(model);
        setModelFormOpen(true);
    };
    const closeModelForm = (open: boolean) => {
        if (!open) setEditingModel(null);
        setModelFormOpen(open);
    };

    const modelsBasePath = brandsIndexPath.replace(/\/brands$/, '') + '/models';

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(brandsIndexPath)}>
            <Head title="Marca" />

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
                            Marca
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de marcas y modelos de vehículos.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Tag className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Marcas</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{brands.length}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <Car className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Modelos</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {vehicleModels.length}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <LayoutGrid className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {brands.length + vehicleModels.length}
                        </span>
                    </span>
                </div>

                <div className="border-t border-content-border pt-4" />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Panel Marcas */}
                    <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <div className="border-b border-content-border p-3 sm:p-4 flex items-center justify-between gap-2">
                            <h2 className="font-semibold text-foreground text-base">Marcas</h2>
                            {can.create_brand && (
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
                            {brands.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-8">
                                    <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
                                    <span className="text-muted-foreground text-sm">No hay marcas.</span>
                                    {can.create_brand && (
                                        <Button size="sm" onClick={openCreateBrand} className="cursor-pointer mt-1">
                                            <Plus className="size-4 mr-1" />
                                            Crear primera marca
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-1 max-h-[min(420px,55vh)] overflow-y-auto pr-1">
                                    {brands.map((brand) => (
                                        <li
                                            key={brand.id}
                                            role="button"
                                            tabIndex={0}
                                            className={`flex items-center justify-between gap-2 rounded-md border border-content-border/50 py-2 px-2.5 transition-colors shrink-0 cursor-pointer ${
                                                selectedBrandId === brand.id
                                                    ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                                                    : 'hover:bg-content-muted/30'
                                            }`}
                                            onClick={() =>
                                                setSelectedBrandId((prev) =>
                                                    prev === brand.id ? null : brand.id,
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setSelectedBrandId((prev) =>
                                                        prev === brand.id ? null : brand.id,
                                                    );
                                                }
                                            }}
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
                                                    {brand.status === 'active' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <ActionButtons
                                                    canEdit={can.update_brand}
                                                    canDelete={can.delete_brand}
                                                    canAssignPermissions={false}
                                                    onEdit={() => openEditBrand(brand)}
                                                    onDelete={() => setDeleteBrand(brand)}
                                                    deleteUrl={
                                                        can.delete_brand ? `${brandsIndexPath}/${brand.id}` : undefined
                                                    }
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Panel Modelos */}
                    <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <div className="border-b border-content-border p-3 sm:p-4 flex items-center justify-between gap-2">
                            <h2 className="font-semibold text-foreground text-base">
                                Modelos
                                {selectedBrandId != null && (
                                    <span className="text-muted-foreground font-normal text-sm ml-1">
                                        ({brands.find((b) => b.id === selectedBrandId)?.name})
                                    </span>
                                )}
                            </h2>
                            {can.create_vehicle_model && selectedBrandId != null && (
                                <Button
                                    size="sm"
                                    onClick={openCreateModel}
                                    className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                                >
                                    <Plus className="size-4" />
                                    Nuevo modelo
                                </Button>
                            )}
                        </div>
                        <div className="p-3 sm:p-4">
                            {selectedBrandId == null ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-8">
                                    <Car className="size-10 text-muted-foreground/60" aria-hidden />
                                    <span className="text-muted-foreground text-sm text-center">
                                        Seleccione una marca para ver sus modelos.
                                    </span>
                                </div>
                            ) : modelsForSelectedBrand.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-8">
                                    <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
                                    <span className="text-muted-foreground text-sm">No hay modelos en esta marca.</span>
                                    {can.create_vehicle_model && (
                                        <Button size="sm" onClick={openCreateModel} className="cursor-pointer mt-1">
                                            <Plus className="size-4 mr-1" />
                                            Crear primer modelo
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-1 max-h-[min(420px,55vh)] overflow-y-auto pr-1">
                                    {modelsForSelectedBrand.map((model) => (
                                        <li
                                            key={model.id}
                                            className="flex items-center justify-between gap-2 rounded-md border border-content-border/50 py-2 px-2.5 hover:bg-content-muted/30 transition-colors shrink-0"
                                        >
                                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                                <span className="font-medium text-foreground text-sm truncate">
                                                    {model.name}
                                                </span>
                                                <span
                                                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                                                        model.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                            : 'bg-content-muted/60 text-muted-foreground'
                                                    }`}
                                                >
                                                    {model.status === 'active' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <ActionButtons
                                                canEdit={can.update_vehicle_model}
                                                canDelete={can.delete_vehicle_model}
                                                canAssignPermissions={false}
                                                onEdit={() => openEditModel(model)}
                                                onDelete={() => setDeleteModel(model)}
                                                deleteUrl={
                                                    can.delete_vehicle_model
                                                        ? `${modelsBasePath}/${model.id}`
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

            <BrandFormModal
                open={brandFormOpen}
                onOpenChange={closeBrandForm}
                brand={editingBrand}
                brandsIndexPath={brandsIndexPath}
            />
            <VehicleModelFormModal
                open={modelFormOpen}
                onOpenChange={closeModelForm}
                vehicleModel={editingModel}
                selectedBrandId={selectedBrandId}
                brandsIndexPath={brandsIndexPath}
            />
            <DeleteBrandDialog
                open={Boolean(deleteBrand)}
                onOpenChange={(open) => !open && setDeleteBrand(null)}
                brand={deleteBrand}
                brandsIndexPath={brandsIndexPath}
            />
            <DeleteVehicleModelDialog
                open={Boolean(deleteModel)}
                onOpenChange={(open) => !open && setDeleteModel(null)}
                vehicleModel={deleteModel}
                brandsIndexPath={brandsIndexPath}
            />
        </AppLayout>
    );
}
