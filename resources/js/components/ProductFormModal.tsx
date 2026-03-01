import { router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { X, ImageIcon } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Product } from '@/types';

const RequiredAsterisk = () => <span className="text-destructive" aria-hidden>*</span>;

type TypeOption = { id: number; name: string };
type BrandOption = { id: number; name: string; inventory_type_id: number };

type ProductFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    selectedBrandId: number | null;
    productsIndexPath: string;
    inventoryTypesForSelect?: TypeOption[];
    inventoryBrandsForSelect?: BrandOption[];
};

export function ProductFormModal({
    open,
    onOpenChange,
    product,
    selectedBrandId,
    productsIndexPath,
    inventoryTypesForSelect = [],
    inventoryBrandsForSelect = [],
}: ProductFormModalProps) {
    const isEdit = Boolean(product?.id);
    const basePath = productsIndexPath.replace(/\/$/, '');
    const brandsBasePath = basePath.replace(/\/products$/, '') + '/brands';
    const productsBasePath = basePath;

    const [tagInput, setTagInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const typeIdFromProduct = product?.inventory_brand?.inventory_type_id ?? product?.inventory_brand?.inventory_type?.id ?? 0;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: product?.name ?? '',
        description: (product?.description as string) ?? '',
        sale_price: product?.sale_price ?? '',
        purchase_price: product?.purchase_price ?? '',
        stock: product?.stock ?? 0,
        status: (product?.status as string) ?? 'active',
        inventory_type_id: typeIdFromProduct,
        inventory_brand_id: product?.inventory_brand_id ?? selectedBrandId ?? 0,
        keywords: (product?.keywords?.map((k) => k.name) ?? []) as string[],
        image: null as File | null,
    });

    const selectedTypeId = Number(data.inventory_type_id) || 0;
    const brandsByType = selectedTypeId > 0
        ? inventoryBrandsForSelect.filter((b) => b.inventory_type_id === selectedTypeId)
        : [];

    useEffect(() => {
        if (open) {
            const typeId = typeIdFromProduct || 0;
            setData({
                name: product?.name ?? '',
                description: (product?.description as string) ?? '',
                sale_price: product?.sale_price ?? '',
                purchase_price: product?.purchase_price ?? '',
                stock: product?.stock ?? 0,
                status: (product?.status as string) ?? 'active',
                inventory_type_id: typeId,
                inventory_brand_id: product?.inventory_brand_id ?? selectedBrandId ?? 0,
                keywords: product?.keywords?.map((k) => k.name) ?? [],
                image: null,
            });
            setTagInput('');
            setImagePreview(product?.image_url ?? null);
        }
    }, [
        open,
        product?.id,
        product?.name,
        product?.description,
        product?.sale_price,
        product?.purchase_price,
        product?.stock,
        product?.status,
        product?.inventory_brand_id,
        product?.inventory_brand?.inventory_type_id,
        product?.inventory_brand?.inventory_type?.id,
        product?.keywords,
        selectedBrandId,
        typeIdFromProduct,
    ]);

    const addKeyword = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        const current = Array.isArray(data.keywords) ? data.keywords : [];
        if (current.includes(trimmed)) return;
        setData('keywords', [...current, trimmed]);
        setTagInput('');
    };

    const removeKeyword = (index: number) => {
        const current = Array.isArray(data.keywords) ? data.keywords : [];
        setData(
            'keywords',
            current.filter((_, i) => i !== index),
        );
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addKeyword(tagInput);
        }
    };

    const brandIdForCreate = selectedBrandId ?? (Number(data.inventory_brand_id) || 0);

    const onTypeChange = (value: string) => {
        const id = value === '' ? 0 : Number(value);
        setData('inventory_type_id', id);
        setData('inventory_brand_id', 0);
    };

    const buildFormData = (): FormData => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('sale_price', String(data.sale_price));
        formData.append('purchase_price', String(data.purchase_price));
        formData.append('stock', String(data.stock));
        formData.append('status', data.status);
        if (Number(data.inventory_brand_id) > 0) {
            formData.append('inventory_brand_id', String(data.inventory_brand_id));
        }
        if (Array.isArray(data.keywords)) {
            data.keywords.forEach((k) => formData.append('keywords[]', k));
        }
        if (data.image instanceof File) {
            formData.append('image', data.image);
        }
        return formData;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const onDone = () => {
            reset();
            onOpenChange(false);
        };
        const hasFile = data.image instanceof File;
        if (isEdit && product) {
            if (hasFile) {
                const formData = buildFormData();
                formData.append('_method', 'PUT');
                router.post(`${productsBasePath}/${product.id}`, formData, {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: onDone,
                });
            } else {
                put(`${productsBasePath}/${product.id}`, {
                    preserveScroll: true,
                    onSuccess: onDone,
                });
            }
        } else if (brandIdForCreate > 0) {
            if (hasFile) {
                const formData = buildFormData();
                router.post(`${brandsBasePath}/${brandIdForCreate}/products`, formData, {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: onDone,
                });
            } else {
                post(`${brandsBasePath}/${brandIdForCreate}/products`, {
                    preserveScroll: true,
                    onSuccess: onDone,
                });
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
        e.target.value = '';
    };

    const clearImage = () => {
        setData('image', null);
        setImagePreview(isEdit && product?.image_url ? product.image_url : null);
    };

    const canSubmit =
        (isEdit || (selectedTypeId > 0 && brandIdForCreate > 0)) &&
        data.name.trim() !== '' &&
        String(data.sale_price).trim() !== '' &&
        String(data.purchase_price).trim() !== '';
    const keywordsList = Array.isArray(data.keywords) ? data.keywords : [];

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            reset();
            setTagInput('');
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isEdit ? 'Editar producto' : 'Nuevo producto'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit
                            ? 'Modifique los datos del producto y sus palabras clave.'
                            : 'Indique los datos del producto y agregue palabras clave (tags).'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="product-name" className="text-foreground">
                            Nombre <RequiredAsterisk />
                        </Label>
                        <Input
                            id="product-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value.toUpperCase())}
                            placeholder="ej. FILTRO DE ACEITE"
                            className="border-content-border"
                            autoFocus
                            autoComplete="off"
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product-description" className="text-foreground">
                            Descripción
                        </Label>
                        <Input
                            id="product-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Opcional"
                            className="border-content-border"
                            autoComplete="off"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="product-sale-price" className="text-foreground">
                                Precio venta <RequiredAsterisk />
                            </Label>
                            <Input
                                id="product-sale-price"
                                type="number"
                                step="0.01"
                                min={0}
                                value={data.sale_price}
                                onChange={(e) =>
                                    setData('sale_price', e.target.value === '' ? '' : e.target.value)
                                }
                                placeholder="0.00"
                                className="border-content-border"
                            />
                            {errors.sale_price && (
                                <p className="text-sm text-destructive">{errors.sale_price}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-purchase-price" className="text-foreground">
                                Precio compra <RequiredAsterisk />
                            </Label>
                            <Input
                                id="product-purchase-price"
                                type="number"
                                step="0.01"
                                min={0}
                                value={data.purchase_price}
                                onChange={(e) =>
                                    setData(
                                        'purchase_price',
                                        e.target.value === '' ? '' : e.target.value,
                                    )
                                }
                                placeholder="0.00"
                                className="border-content-border"
                            />
                            {errors.purchase_price && (
                                <p className="text-sm text-destructive">{errors.purchase_price}</p>
                            )}
                        </div>
                    </div>
                    {(inventoryTypesForSelect.length > 0 || inventoryBrandsForSelect.length > 0) && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="product-type" className="text-foreground">
                                    Tipo <RequiredAsterisk />
                                </Label>
                                <Select
                                    value={selectedTypeId ? String(selectedTypeId) : ''}
                                    onValueChange={onTypeChange}
                                >
                                    <SelectTrigger id="product-type" className="border-content-border">
                                        <SelectValue placeholder="Elija un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {inventoryTypesForSelect.map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.inventory_type_id && (
                                    <p className="text-sm text-destructive">{errors.inventory_type_id}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-brand" className="text-foreground">
                                    Marca <RequiredAsterisk />
                                </Label>
                                <Select
                                    value={selectedTypeId ? (String(data.inventory_brand_id || '')) : ''}
                                    onValueChange={(v) => setData('inventory_brand_id', v === '' ? 0 : Number(v))}
                                    disabled={selectedTypeId === 0}
                                >
                                    <SelectTrigger id="product-brand" className="border-content-border">
                                        <SelectValue placeholder={selectedTypeId ? 'Elija una marca' : 'Elija un tipo primero'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brandsByType.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                        {errors.inventory_brand_id && (
                                <p className="text-sm text-destructive">{errors.inventory_brand_id}</p>
                            )}
                        </div>
                    </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="product-image" className="text-foreground">
                            Imagen del producto
                        </Label>
                        <input
                            ref={fileInputRef}
                            id="product-image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        <div className="flex items-center gap-3">
                            {(imagePreview || data.image) && (
                                <div className="relative shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <img
                                        src={imagePreview ?? ''}
                                        alt="Vista previa"
                                        className="size-20 rounded-md border border-content-border object-cover cursor-pointer"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                        className="absolute -right-1 -top-1 cursor-pointer rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                                        aria-label="Quitar imagen"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="cursor-pointer border-content-border"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon className="size-4 mr-1" />
                                {imagePreview || data.image ? 'Cambiar imagen' : 'Subir imagen'}
                            </Button>
                        </div>
                        {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product-stock" className="text-foreground">
                            Stock <RequiredAsterisk />
                        </Label>
                        <Input
                            id="product-stock"
                            type="number"
                            min={0}
                            value={data.stock}
                            onChange={(e) =>
                                setData('stock', e.target.value === '' ? 0 : parseInt(e.target.value, 10))
                            }
                            placeholder="0"
                            className="border-content-border"
                        />
                        {errors.stock && <p className="text-sm text-destructive">{errors.stock}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product-keywords" className="text-foreground">
                            Palabras clave (tags)
                        </Label>
                        <div className="flex flex-wrap gap-2 rounded-md border border-content-border bg-background px-3 py-2 min-h-10">
                            {keywordsList.map((keyword, index) => (
                                <Badge
                                    key={`${keyword}-${index}`}
                                    variant="secondary"
                                    className="cursor-pointer gap-1 pr-1 font-normal bg-sky-100 text-sky-800 border border-sky-200 hover:bg-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800 dark:hover:bg-sky-900/50"
                                    onClick={() => removeKeyword(index)}
                                >
                                    {keyword}
                                    <X className="size-3 shrink-0" aria-hidden />
                                </Badge>
                            ))}
                            <input
                                id="product-keywords"
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                onBlur={() => {
                                    if (tagInput.trim()) addKeyword(tagInput);
                                }}
                                placeholder="Escriba y pulse Enter o coma"
                                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                autoComplete="off"
                            />
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Agregue tags para buscar el producto por palabras clave. Pulse Enter o
                            coma para añadir.
                        </p>
                        {errors.keywords && (
                            <p className="text-sm text-destructive">{errors.keywords}</p>
                        )}
                        {Array.isArray(errors.keywords) && (
                            <p className="text-sm text-destructive">
                                {errors.keywords.join(', ')}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="product-status"
                                checked={data.status === 'active'}
                                onCheckedChange={(checked) =>
                                    setData('status', checked === true ? 'active' : 'inactive')
                                }
                                className="border-content-border"
                            />
                            <Label
                                htmlFor="product-status"
                                className="text-foreground cursor-pointer font-normal"
                            >
                                Activo
                            </Label>
                        </div>
                        {errors.status && (
                            <p className="text-sm text-destructive">{errors.status}</p>
                        )}
                    </div>
                    {!isEdit && inventoryTypesForSelect.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No hay tipos activos. Cree tipos en Inventario → Tipo.
                        </p>
                    )}
                    <DialogFooter className="flex flex-wrap gap-2 sm:justify-end sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer border-content-border min-w-0 flex-1 sm:flex-none"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !canSubmit}
                            className="cursor-pointer min-w-0 flex-1 sm:flex-none bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                        >
                            {processing ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
