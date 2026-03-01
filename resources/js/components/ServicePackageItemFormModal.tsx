import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { ServicePackageItem } from '@/types';
import ReactSelect from 'react-select';

type ProductOption = {
    value: number;
    label: string;
    sale_price: number;
    purchase_price: number | null;
};

type ServicePackageItemFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: ServicePackageItem | null;
    itemsBasePath: string;
    productsForSelect: ProductOption[];
};

export function ServicePackageItemFormModal({
    open,
    onOpenChange,
    item,
    itemsBasePath,
    productsForSelect,
}: ServicePackageItemFormModalProps) {
    const isEdit = Boolean(item?.id);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        type: item?.type ?? 'product',
        product_id: item?.product_id ?? null,
        quantity: item?.quantity ?? 1,
        unit_price: item?.unit_price ?? 0,
        notes: item?.notes ?? '',
    });

    useEffect(() => {
        if (open) {
            setData({
                type: item?.type ?? 'product',
                product_id: item?.product_id ?? null,
                quantity: item?.quantity ?? 1,
                unit_price: item?.unit_price ?? 0,
                notes: item?.notes ?? '',
            });
        }
    }, [open, item, setData]);

    // Radix Dialog bloquea pointer-events fuera del contenido; el menú del select está en body.
    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            document.body.style.pointerEvents = '';
        }, 0);
        return () => {
            clearTimeout(timer);
            document.body.style.pointerEvents = 'auto';
        };
    }, [open]);

    const selectedProduct = productsForSelect.find((p) => p.value === data.product_id) ?? null;

    const isProductType = true;

    const canSubmit =
        data.product_id != null &&
        Number(data.quantity) > 0 &&
        Number(data.unit_price) >= 0;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && item) {
            put(`${itemsBasePath}/${item.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(itemsBasePath, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="border-content-border bg-card w-[calc(100%-1rem)] max-w-lg sm:w-full"
                onPointerDownOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[role="listbox"]') ?? target.closest('[class*="Menu"]')) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isEdit ? 'Editar ítem del paquete' : 'Agregar ítem al paquete'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit
                            ? 'Modifique los datos del ítem del paquete.'
                            : 'Seleccione un producto, cantidad y precio unitario para agregar al paquete.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-foreground">
                            Producto {isProductType && <span className="text-destructive">*</span>}
                        </Label>
                        <ReactSelect<ProductOption>
                            inputId="spi-product"
                            value={selectedProduct}
                            isDisabled={!isProductType}
                            onChange={(opt) => {
                                if (!opt) {
                                    setData('product_id', null);
                                    return;
                                }
                                setData('product_id', opt.value);
                                setData('unit_price', opt.sale_price);
                            }}
                            options={productsForSelect}
                            placeholder="Buscar producto por nombre o marca…"
                            noOptionsMessage={() => 'No hay coincidencias'}
                            isClearable
                            getOptionLabel={(opt) => opt.label}
                            formatOptionLabel={(opt, meta) => {
                                if (meta?.context === 'value') {
                                    return opt.label;
                                }
                                const purchase = opt.purchase_price != null ? opt.purchase_price : null;
                                return (
                                    <div className="pointer-events-none flex flex-col gap-0.5">
                                        <span>{opt.label}</span>
                                        {purchase != null && (
                                            <span className="text-muted-foreground text-xs">
                                                Precio compra: S/ {Number(purchase).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                );
                            }}
                            classNames={{
                                control: () =>
                                    '!min-h-9 !max-h-9 !rounded-md !border-content-border !border !bg-transparent !shadow-xs !text-xs sm:!text-sm',
                                valueContainer: () => '!py-0',
                                singleValue: () => '!leading-9 !m-0 !text-left !text-xs sm:!text-sm !truncate',
                                placeholder: () => '!text-muted-foreground !text-xs sm:!text-sm',
                                menuPortal: () => 'z-[10050] pointer-events-auto',
                                menu: () =>
                                    '!rounded-md !border !border-content-border !bg-popover !text-popover-foreground !shadow-lg',
                                option: () => '!text-xs sm:!text-sm',
                                input: () => '!text-xs sm:!text-sm',
                            }}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                            menuPosition="fixed"
                            styles={{
                                control: (base) => ({ ...base, minHeight: 36, maxHeight: 36 }),
                                input: (base) => ({ ...base, margin: 0, padding: 0 }),
                                menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
                            }}
                        />
                        {errors.product_id && (
                            <p className="text-sm text-destructive">{errors.product_id}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="spi-quantity" className="text-foreground">
                                Cantidad <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="spi-quantity"
                                type="number"
                                min={0.01}
                                step={0.01}
                                value={data.quantity}
                                onChange={(e) => setData('quantity', Number(e.target.value) || 0)}
                                className="border-content-border"
                            />
                            {errors.quantity && (
                                <p className="text-sm text-destructive">{errors.quantity}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="spi-unit_price" className="text-foreground">
                                Precio unitario <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="spi-unit_price"
                                type="number"
                                min={0}
                                step={0.01}
                                value={data.unit_price}
                                onChange={(e) => setData('unit_price', Number(e.target.value) || 0)}
                                className="border-content-border"
                            />
                            {errors.unit_price && (
                                <p className="text-sm text-destructive">{errors.unit_price}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="spi-notes" className="text-foreground">
                            Notas
                        </Label>
                        <Input
                            id="spi-notes"
                            value={data.notes ?? ''}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Opcional"
                            className="border-content-border"
                        />
                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                    </div>
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
                            {processing ? 'Guardando…' : isEdit ? 'Actualizar' : 'Agregar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

