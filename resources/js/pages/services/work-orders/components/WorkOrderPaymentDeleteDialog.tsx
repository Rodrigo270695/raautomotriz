import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { WorkOrderPaymentItem } from '../types';

type WorkOrderPaymentDeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: WorkOrderPaymentItem | null;
    paymentsBasePath: string;
};

const TYPE_LABELS: Record<string, string> = {
    advance: 'Adelanto',
    partial: 'Abono parcial',
    final: 'Pago final',
};

export function WorkOrderPaymentDeleteDialog({
    open,
    onOpenChange,
    payment,
    paymentsBasePath,
}: WorkOrderPaymentDeleteDialogProps) {
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const offStart = router.on('start', () => setDeleting(true));
        const offFinish = router.on('finish', () => setDeleting(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    if (!payment || !paymentsBasePath) return null;

    const handleDelete = () => {
        router.delete(`${paymentsBasePath}/${payment.id}`, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    const typeLabel = TYPE_LABELS[payment.type] ?? payment.type;
    const label = `Pago ${typeLabel} – S/ ${Number(payment.amount).toFixed(2)}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Eliminar pago</DialogTitle>
                    <DialogDescription>
                        ¿Eliminar este registro de pago? Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <p className="text-muted-foreground text-sm line-clamp-3 rounded-md border border-content-border bg-content-muted/30 p-2">
                    {label}
                </p>
                <DialogFooter className="flex flex-wrap gap-2 sm:justify-end sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleting}
                        className="cursor-pointer border-content-border min-w-0 flex-1 sm:flex-none"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="cursor-pointer min-w-0 flex-1 sm:flex-none"
                    >
                        {deleting ? 'Eliminando…' : 'Eliminar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
