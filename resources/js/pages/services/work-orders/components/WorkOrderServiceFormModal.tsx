import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';
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
import type { WorkOrderServiceItem } from '../types';

type WorkOrderServiceFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: WorkOrderServiceItem | null;
    servicesBasePath: string;
};

export function WorkOrderServiceFormModal({
    open,
    onOpenChange,
    service,
    servicesBasePath,
}: WorkOrderServiceFormModalProps) {
    const isEdit = service != null;

    const { data, setData, post, put, processing, errors, reset } = useForm<{
        description: string;
        quantity: number;
        unit_price: number;
        type?: 'service';
    }>({
        description: '',
        quantity: 1,
        unit_price: 0,
        type: 'service',
    });

    useEffect(() => {
        if (!open) return;
        if (service) {
            const rawDesc = service.description?.trim() ?? '';
            const fallbackDesc = service.product_name
                ? (service.product_brand_name
                    ? `${service.product_brand_name} – ${service.product_name}`
                    : service.product_name)
                : 'Ítem de paquete';
            setData({
                description: rawDesc !== '' ? rawDesc : fallbackDesc,
                quantity: service.quantity ?? 1,
                unit_price: service.unit_price ?? 0,
            });
        } else {
            setData({
                description: '',
                quantity: 1,
                unit_price: 0,
                type: 'service',
            });
        }
    }, [open, service, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!servicesBasePath) return;

        if (isEdit && service) {
            put(`${servicesBasePath}/${service.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(servicesBasePath, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    const canSubmit =
        data.description.trim() !== '' &&
        Number(data.quantity) > 0 &&
        Number(data.unit_price) >= 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-lg sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isEdit ? 'Editar servicio de la orden' : 'Agregar servicio a la orden'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit
                            ? 'Modifique la descripción, cantidad y precio unitario del servicio.'
                            : 'Registre un servicio o producto manual para esta orden.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="wo-service-description" className="text-foreground">
                            Descripción <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="wo-service-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="ej. Cambio de aceite 5W30"
                            className="border-content-border"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="wo-service-quantity" className="text-foreground">
                                Cantidad <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="wo-service-quantity"
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
                            <Label htmlFor="wo-service-unit-price" className="text-foreground">
                                Precio unitario <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="wo-service-unit-price"
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
                            {processing ? 'Guardando…' : isEdit ? 'Actualizar' : 'Agregar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

