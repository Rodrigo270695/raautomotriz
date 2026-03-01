import { useForm } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
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
import ReactSelect from 'react-select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type ProductOption = {
    value: number;
    label: string;
    sale_price: number;
};

type WorkOrderProductFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    servicesBasePath: string;
    productsForSelect: ProductOption[];
};

export function WorkOrderProductFormModal({
    open,
    onOpenChange,
    servicesBasePath,
    productsForSelect,
}: WorkOrderProductFormModalProps) {
    const [mode, setMode] = useState<'inventory' | 'manual'>('inventory');
    const { data, setData, post, processing, errors, reset } = useForm<{
        product_id: number | null;
        type: 'product';
        description: string;
        quantity: number;
        unit_price: number;
    }>({
        product_id: null,
        type: 'product',
        description: '',
        quantity: 1,
        unit_price: 0,
    });

    useEffect(() => {
        if (!open) return;
        setData({
            product_id: null,
            type: 'product',
            description: '',
            quantity: 1,
            unit_price: 0,
        });
        setMode('inventory');
    }, [open, setData]);

    const selectedProduct = useMemo(
        () => productsForSelect.find((p) => p.value === data.product_id) ?? null,
        [productsForSelect, data.product_id]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!servicesBasePath) return;

        post(servicesBasePath, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    const canSubmit =
        ((mode === 'inventory' ? data.product_id != null : data.description.trim() !== '') &&
        Number(data.quantity) > 0 &&
        Number(data.unit_price) >= 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-lg sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        Agregar producto a la orden
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Registre un producto adicional (nombre, cantidad y precio unitario) para esta orden.
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-foreground">Origen</Label>
                        <ToggleGroup
                            type="single"
                            value={mode}
                            onValueChange={(val) => {
                                if (val === 'inventory' || val === 'manual') {
                                    setMode(val);
                                    if (val === 'manual') {
                                        setData((prev) => ({ ...prev, product_id: null }));
                                    }
                                }
                            }}
                            className="inline-flex rounded-md border border-content-border bg-content-muted/40 p-0.5"
                            size="sm"
                            variant="outline"
                        >
                            <ToggleGroupItem value="inventory" className="text-xs sm:text-sm px-2">
                                Inventario
                            </ToggleGroupItem>
                            <ToggleGroupItem value="manual" className="text-xs sm:text-sm px-2">
                                Manual
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    {mode === 'inventory' && (
                        <div className="space-y-2">
                            <Label className="text-foreground">
                                Producto (inventario)
                            </Label>
                            <ReactSelect<ProductOption>
                                inputId="wo-product-inventory"
                                value={selectedProduct}
                                onChange={(opt) => {
                                    if (!opt) {
                                        setData((prev) => ({ ...prev, product_id: null }));
                                        return;
                                    }
                                    setData((prev) => ({
                                        ...prev,
                                        product_id: opt.value,
                                        description:
                                            prev.description && prev.description.trim() !== ''
                                                ? prev.description
                                                : opt.label,
                                        unit_price:
                                            prev.unit_price && prev.unit_price > 0
                                                ? prev.unit_price
                                                : opt.sale_price ?? 0,
                                    }));
                                }}
                                options={productsForSelect}
                                placeholder="Buscar producto por nombre o marca…"
                                noOptionsMessage={() => 'No hay coincidencias'}
                                isClearable
                                classNames={{
                                    control: () =>
                                        '!min-h-9 !rounded-md !border-content-border !border !bg-transparent !shadow-xs',
                                    placeholder: () => '!text-muted-foreground',
                                    menuPortal: () => 'z-[10050]',
                                    menu: () =>
                                        '!rounded-md !border !border-content-border !bg-popover !text-popover-foreground !shadow-lg',
                                    option: () => '!text-sm',
                                    input: () => '!text-sm',
                                }}
                                styles={{
                                    control: (base) => ({ ...base, minHeight: 36 }),
                                    input: (base) => ({ ...base, margin: 0, padding: 0 }),
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                }}
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                                formatOptionLabel={(opt) => (
                                    <div className="flex flex-col">
                                        <span>{opt.label}</span>
                                        {opt.sale_price != null && (
                                            <span className="text-muted-foreground text-xs">
                                                P. venta: S/ {opt.sale_price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="wo-product-description" className="text-foreground">
                            Descripción <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="wo-product-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="ej. Filtro de aceite XYZ"
                            className="border-content-border"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="wo-product-quantity" className="text-foreground">
                                Cantidad <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="wo-product-quantity"
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
                            <Label htmlFor="wo-product-unit-price" className="text-foreground">
                                Precio unitario <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="wo-product-unit-price"
                                type="number"
                                min={0}
                                step={0.01}
                                value={data.unit_price}
                                onChange={(e) =>
                                    setData('unit_price', Number(e.target.value) || 0)
                                }
                                className="border-content-border"
                            />
                            {errors.unit_price && (
                                <p className="text-sm text-destructive">{errors.unit_price}</p>
                            )}
                        </div>
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
                            {processing ? 'Guardando…' : 'Agregar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

