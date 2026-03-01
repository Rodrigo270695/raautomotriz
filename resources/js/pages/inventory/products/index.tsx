import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Package, LayoutGrid, Plus, Inbox, FileText, ImageIcon, FileSpreadsheet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Product, PaginatedResponse } from '@/types';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ProductFormModal } from '@/components/ProductFormModal';
import { DeleteProductDialog } from '@/components/DeleteProductDialog';

const getBreadcrumbs = (productsPath: string): BreadcrumbItem[] => [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Inventario', href: '#' },
    { title: 'Producto', href: productsPath },
];

type TypeOption = { id: number; name: string };
type BrandOption = { id: number; name: string; inventory_type_id: number };

type ProductsIndexProps = {
    products: PaginatedResponse<Product>;
    filters: {
        search?: string;
        per_page?: number;
        sort_by?: string;
        sort_dir?: string;
        filter_status?: string;
        filter_type_id?: string;
        filter_brand_id?: string;
    };
    productsIndexPath: string;
    inventoryTypesForSelect: TypeOption[];
    inventoryBrandsForSelect: BrandOption[];
    stats: {
        total_products: number;
        active_products: number;
    };
    can: { create: boolean; update: boolean; delete: boolean; export: boolean; view_audit: boolean };
    exportUrl: string;
};

function typeBrandDisplay(p: Product): string {
    const brand = p.inventory_brand?.name;
    const type = p.inventory_brand?.inventory_type?.name;
    if (type && brand) return `${type} – ${brand}`;
    if (brand) return brand;
    return '—';
}

function formatPrice(value: string | number): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(n)) return '—';
    return new Intl.NumberFormat('es', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

export default function InventoryProductsIndex({
    products,
    filters,
    productsIndexPath,
    inventoryTypesForSelect,
    inventoryBrandsForSelect,
    stats,
    can,
    exportUrl,
}: ProductsIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
    const [imageViewUrl, setImageViewUrl] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const indexPath = productsIndexPath;

    useEffect(() => {
        const offStart = router.on('start', () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    const refreshSelectData = () => {
        router.reload({
            only: ['inventoryTypesForSelect', 'inventoryBrandsForSelect'],
            preserveState: true,
        });
    };

    const openCreate = () => {
        setEditingProduct(null);
        setFormOpen(true);
        refreshSelectData();
    };
    const openEdit = (p: Product) => {
        setEditingProduct(p);
        setFormOpen(true);
        refreshSelectData();
    };
    const closeForm = (open: boolean) => {
        if (!open) setEditingProduct(null);
        setFormOpen(open);
    };

    const sortBy = filters.sort_by ?? 'name';
    const sortDir = (filters.sort_dir ?? 'asc') as 'asc' | 'desc';
    const onSort = (key: string) => {
        const nextDir = sortBy === key ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        router.get(indexPath, { ...filters, sort_by: key, sort_dir: nextDir }, { preserveState: true });
    };
    const onFilterStatus = (value: string) => {
        router.get(indexPath, { ...filters, filter_status: value === 'all' ? undefined : value, page: undefined }, { preserveState: true });
    };
    const onFilterType = (value: string) => {
        router.get(indexPath, {
            ...filters,
            filter_type_id: value || undefined,
            filter_brand_id: undefined,
            page: undefined,
        }, { preserveState: true });
    };
    const onFilterBrand = (value: string) => {
        router.get(indexPath, { ...filters, filter_brand_id: value || undefined, page: undefined }, { preserveState: true });
    };

    const filterTypeId = filters.filter_type_id ?? '';
    const filterBrandId = filters.filter_brand_id ?? '';
    const brandsForBrandFilter = filterTypeId
        ? inventoryBrandsForSelect.filter((b) => b.inventory_type_id === Number(filterTypeId))
        : [];

    const columns = [
        {
            key: 'image',
            label: 'Imagen',
            className: 'w-14',
            render: (p: Product) => {
                const url = p.image_url;
                if (!url) {
                    return (
                        <span className="flex size-10 items-center justify-center rounded border border-content-border bg-content-muted/30 text-muted-foreground">
                            <ImageIcon className="size-5" aria-hidden />
                        </span>
                    );
                }
                return (
                    <button
                        type="button"
                        onClick={() => setImageViewUrl(url)}
                        className="flex size-10 shrink-0 cursor-pointer overflow-hidden rounded border border-content-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                        aria-label="Ver imagen"
                    >
                        <img src={url} alt="" className="size-full object-cover" />
                    </button>
                );
            },
        },
        {
            key: 'name',
            label: 'Nombre',
            sortKey: 'name',
            render: (p: Product) => (
                <span className="font-medium text-foreground">{p.name}</span>
            ),
        },
        {
            key: 'brand',
            label: 'Tipo – Marca',
            render: (p: Product) => (
                <span className="text-muted-foreground text-sm">{typeBrandDisplay(p)}</span>
            ),
        },
        {
            key: 'sale_price',
            label: 'P. venta',
            sortKey: 'sale_price',
            render: (p: Product) => (
                <span className="text-muted-foreground text-sm">{formatPrice(p.sale_price)}</span>
            ),
        },
        {
            key: 'purchase_price',
            label: 'P. compra',
            sortKey: 'purchase_price',
            render: (p: Product) => (
                <span className="text-muted-foreground text-sm">{formatPrice(p.purchase_price)}</span>
            ),
        },
        {
            key: 'stock',
            label: 'Stock',
            sortKey: 'stock',
            render: (p: Product) => {
                const stock = Number(p.stock) ?? 0;
                const stockClass =
                    stock <= 0
                        ? 'font-semibold text-red-600 dark:text-red-400'
                        : stock <= 5
                          ? 'font-medium text-amber-600 dark:text-amber-400'
                          : 'font-medium text-emerald-600 dark:text-emerald-400';
                return <span className={`text-sm ${stockClass}`}>{p.stock}</span>;
            },
        },
        ...(can.view_audit
            ? [{
                key: 'audit',
                label: 'Creado / Modificado',
                render: (p: Product) => (
                    <span className="flex flex-col gap-0 leading-tight text-muted-foreground text-xs">
                        <span title="Creado por">{p.created_by_name ?? '—'}</span>
                        <span title="Modificado por" className="text-muted-foreground/80">{p.updated_by_name ?? '—'}</span>
                    </span>
                ),
            }]
            : []),
        {
            key: 'status',
            label: 'Estado',
            sortKey: 'status',
            render: (p: Product) => (
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-content-muted/60 text-muted-foreground'
                    }`}
                >
                    {p.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[100px] text-right',
            render: (p: Product) => (
                <ActionButtons
                    canEdit={can.update}
                    canDelete={can.delete}
                    canAssignPermissions={false}
                    onEdit={() => openEdit(p)}
                    onDelete={() => setDeleteProduct(p)}
                    deleteUrl={can.delete ? `${productsIndexPath}/${p.id}` : undefined}
                />
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            <Inbox className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay productos.</span>
            {can.create && (
                <Button size="sm" onClick={openCreate} className="cursor-pointer mt-1">
                    <Plus className="size-4 mr-1" />
                    Registrar primer producto
                </Button>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(productsIndexPath)}>
            <Head title="Inventario - Producto" />

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
                            Producto
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestión de productos de inventario.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {can.export && exportUrl && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="cursor-pointer shrink-0 border-[#217346]/40 bg-[#217346] text-white hover:bg-[#1a5c38] hover:text-white dark:border-[#217346]/60 dark:bg-[#217346] dark:hover:bg-[#1a5c38]"
                                        asChild
                                    >
                                        <a href={exportUrl} download target="_blank" rel="noopener noreferrer" aria-label="Descargar Excel">
                                            <FileSpreadsheet className="size-5" />
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Descargar Excel</TooltipContent>
                            </Tooltip>
                        )}
                        {can.create && (
                            <Button
                                onClick={openCreate}
                                className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                            >
                                <Plus className="size-4" />
                                Nuevo producto
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Package className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Productos</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {stats.total_products}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <Package className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Activos</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {stats.active_products}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {products.current_page}
                            <span className="font-normal text-muted-foreground"> / {products.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <LayoutGrid className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                            {products.data.length}
                        </span>
                    </span>
                    {stats.total_products - stats.active_products > 0 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-content-muted/50 px-2.5 py-1">
                            <Package className="size-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Inactivos</span>
                            <span className="font-semibold text-muted-foreground">
                                {stats.total_products - stats.active_products}
                            </span>
                        </span>
                    )}
                </div>

                <div className="border-t border-content-border pt-4" />

                <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                    <div className="border-b border-content-border p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <SearchInput
                                queryKey="search"
                                defaultValue={filters.search ?? ''}
                                placeholder="Buscar por nombre, descripción, marca o palabras clave…"
                                className="w-full sm:w-72"
                                inputClassName="focus-visible:border-primary/50 focus-visible:ring-primary/30"
                            />
                            <Select value={filterTypeId || 'all'} onValueChange={(v) => onFilterType(v === 'all' ? '' : v)}>
                                <SelectTrigger className="w-full sm:w-40 border-content-border">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los tipos</SelectItem>
                                    {inventoryTypesForSelect.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filterBrandId || 'all'}
                                onValueChange={(v) => onFilterBrand(v === 'all' ? '' : v)}
                                disabled={!filterTypeId}
                            >
                                <SelectTrigger className="w-full sm:w-44 border-content-border">
                                    <SelectValue placeholder={filterTypeId ? 'Marca' : 'Elija tipo primero'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las marcas</SelectItem>
                                    {brandsForBrandFilter.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.filter_status ?? 'all'} onValueChange={onFilterStatus}>
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
                                <span className="font-medium text-foreground">{products.total}</span>{' '}
                                resultado{products.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<Product>
                            columns={columns}
                            data={products.data}
                            keyExtractor={(p) => p.id}
                            emptyMessage="No hay productos. Registre uno para comenzar."
                            emptyContent={emptyContent}
                            embedded
                            striped
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                        />
                    </div>

                    <div className="block md:hidden">
                        {products.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {products.data.map((p) => (
                                    <li key={p.id}>
                                        <DataTableCard
                                            title={p.name}
                                            actions={
                                                <ActionButtons
                                                    showLabels
                                                    canEdit={can.update}
                                                    canDelete={can.delete}
                                                    canAssignPermissions={false}
                                                    onEdit={() => openEdit(p)}
                                                    onDelete={() => setDeleteProduct(p)}
                                                    deleteUrl={can.delete ? `${productsIndexPath}/${p.id}` : undefined}
                                                />
                                            }
                                            fields={[
                                                {
                                                    label: 'Imagen',
                                                    value: p.image_url ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setImageViewUrl(p.image_url ?? null)}
                                                            className="text-primary underline focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                        >
                                                            Ver imagen
                                                        </button>
                                                    ) : (
                                                        'Sin imagen'
                                                    ),
                                                },
                                                { label: 'Tipo – Marca', value: typeBrandDisplay(p) },
                                                { label: 'P. venta', value: formatPrice(p.sale_price) },
                                                { label: 'P. compra', value: formatPrice(p.purchase_price) },
                                                {
                                                    label: 'Stock',
                                                    value: (() => {
                                                        const s = Number(p.stock) ?? 0;
                                                        const c =
                                                            s <= 0
                                                                ? 'font-semibold text-red-600 dark:text-red-400'
                                                                : s <= 5
                                                                  ? 'font-medium text-amber-600 dark:text-amber-400'
                                                                  : 'font-medium text-emerald-600 dark:text-emerald-400';
                                                        return <span className={c}>{p.stock}</span>;
                                                    })(),
                                                },
                                                ...(can.view_audit && p.audit_display
                                                    ? [{ label: 'Creado / Modificado', value: p.audit_display }]
                                                    : []),
                                                { label: 'Estado', value: p.status === 'active' ? 'Activo' : 'Inactivo' },
                                            ]}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="border-t border-content-border px-3 py-3 sm:px-4">
                        <TablePagination
                            from={products.from}
                            to={products.to}
                            total={products.total}
                            perPage={products.per_page}
                            currentPage={products.current_page}
                            lastPage={products.last_page}
                            links={products.links}
                            indexPath={productsIndexPath}
                            search={filters.search}
                            extraParams={{
                                sort_by: sortBy,
                                sort_dir: sortDir,
                                filter_status: filters.filter_status,
                                filter_type_id: filters.filter_type_id,
                                filter_brand_id: filters.filter_brand_id,
                            }}
                        />
                    </div>
                </div>
            </div>

            <ProductFormModal
                open={formOpen}
                onOpenChange={closeForm}
                product={editingProduct}
                selectedBrandId={null}
                productsIndexPath={productsIndexPath}
                inventoryTypesForSelect={inventoryTypesForSelect}
                inventoryBrandsForSelect={inventoryBrandsForSelect}
            />
            <DeleteProductDialog
                open={Boolean(deleteProduct)}
                onOpenChange={(open) => !open && setDeleteProduct(null)}
                product={deleteProduct}
                productsIndexPath={productsIndexPath}
            />
            <Dialog open={Boolean(imageViewUrl)} onOpenChange={(open) => !open && setImageViewUrl(null)}>
                <DialogContent className="border-content-border bg-card max-w-4xl p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Imagen del producto</DialogTitle>
                    <DialogDescription className="sr-only">
                        Visualización de la imagen del producto. Cierre el diálogo para volver.
                    </DialogDescription>
                    {imageViewUrl && (
                        <img
                            src={imageViewUrl}
                            alt="Imagen del producto"
                            className="w-full h-auto max-h-[85vh] object-contain cursor-pointer"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
