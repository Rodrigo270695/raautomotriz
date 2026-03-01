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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { WorkOrderPaymentItem } from '../types';

const PAYMENT_TYPES = [
    { value: 'advance', label: 'Adelanto' },
    { value: 'partial', label: 'Abono parcial' },
    { value: 'final', label: 'Pago final' },
] as const;

const PAYMENT_METHODS = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'yape', label: 'Yape' },
    { value: 'plim', label: 'Plim' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'otros', label: 'Otros' },
] as const;

type WorkOrderPaymentFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: WorkOrderPaymentItem | null;
    paymentsBasePath: string;
    /** Si ya existe un pago de tipo adelanto, no se ofrece "Adelanto" en el select (solo Abono / Pago final). */
    hasAdvancePayment?: boolean;
};

function formatDateTimeLocal(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
}

export function WorkOrderPaymentFormModal({
    open,
    onOpenChange,
    payment,
    paymentsBasePath,
    hasAdvancePayment = false,
}: WorkOrderPaymentFormModalProps) {
    const isEdit = payment != null;
    const typeOptions = hasAdvancePayment
        ? PAYMENT_TYPES.filter((t) => t.value !== 'advance')
        : PAYMENT_TYPES;

    const { data, setData, post, put, processing, errors, reset } = useForm<{
        type: string;
        amount: number;
        payment_method: string;
        paid_at: string;
        reference: string;
        notes: string;
    }>({
        type: 'advance',
        amount: 0,
        payment_method: '',
        paid_at: '',
        reference: '',
        notes: '',
    });

    useEffect(() => {
        if (!open) return;
        if (payment) {
            setData({
                type: payment.type,
                amount: payment.amount,
                payment_method: payment.payment_method ?? '',
                paid_at: formatDateTimeLocal(payment.paid_at),
                reference: payment.reference ?? '',
                notes: payment.notes ?? '',
            });
        } else {
            const now = formatDateTimeLocal(new Date().toISOString());
            setData({
                type: hasAdvancePayment ? 'partial' : 'advance',
                amount: 0,
                payment_method: 'efectivo',
                paid_at: now,
                reference: '',
                notes: '',
            });
        }
    }, [open, payment, setData, hasAdvancePayment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentsBasePath) return;

        if (isEdit && payment) {
            put(`${paymentsBasePath}/${payment.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(paymentsBasePath, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    const canSubmit =
        ['advance', 'partial', 'final'].includes(data.type) && Number(data.amount) > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-lg sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isEdit ? 'Editar pago' : 'Registrar pago'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit
                            ? 'Modifique el tipo, monto y datos del pago.'
                            : 'Registre un adelanto, abono o pago final para esta orden.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="wo-payment-type" className="text-foreground">
                                Tipo <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.type}
                                onValueChange={(v) => setData('type', v)}
                            >
                                <SelectTrigger id="wo-payment-type" className="border-content-border">
                                    <SelectValue placeholder="Tipo de pago" />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-sm text-destructive">{errors.type}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wo-payment-amount" className="text-foreground">
                                Monto (S/) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="wo-payment-amount"
                                type="number"
                                min={0.01}
                                step={0.01}
                                value={data.amount || ''}
                                onChange={(e) =>
                                    setData('amount', Number(e.target.value) || 0)
                                }
                                className="border-content-border"
                            />
                            {errors.amount && (
                                <p className="text-sm text-destructive">{errors.amount}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-payment-method" className="text-foreground">
                            Método de pago
                        </Label>
                        <Select
                            value={data.payment_method || 'efectivo'}
                            onValueChange={(v) => setData('payment_method', v)}
                        >
                            <SelectTrigger id="wo-payment-method" className="border-content-border">
                                <SelectValue placeholder="Método" />
                            </SelectTrigger>
                            <SelectContent>
                                {PAYMENT_METHODS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.payment_method && (
                            <p className="text-sm text-destructive">{errors.payment_method}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-payment-paid-at" className="text-foreground">
                            Fecha y hora de pago
                        </Label>
                        <Input
                            id="wo-payment-paid-at"
                            type="datetime-local"
                            value={data.paid_at}
                            onChange={(e) => setData('paid_at', e.target.value)}
                            className="border-content-border"
                        />
                        {errors.paid_at && (
                            <p className="text-sm text-destructive">{errors.paid_at}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-payment-notes" className="text-foreground">
                            Notas
                        </Label>
                        <Input
                            id="wo-payment-notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Opcional"
                            className="border-content-border"
                        />
                        {errors.notes && (
                            <p className="text-sm text-destructive">{errors.notes}</p>
                        )}
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
                            {processing ? 'Guardando…' : isEdit ? 'Actualizar' : 'Registrar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
