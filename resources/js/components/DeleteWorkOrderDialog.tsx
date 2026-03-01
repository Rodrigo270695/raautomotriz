import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { WorkOrder } from '@/types';

type DeleteWorkOrderDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workOrder: WorkOrder | null;
    workOrdersIndexPath: string;
};

export function DeleteWorkOrderDialog({
    open,
    onOpenChange,
    workOrder,
    workOrdersIndexPath,
}: DeleteWorkOrderDialogProps) {
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const offStart = router.on('start', () => setDeleting(true));
        const offFinish = router.on('finish', () => setDeleting(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    if (!workOrder) return null;

    const title = workOrder.vehicle?.plate
        ? `Orden #${workOrder.id} — ${workOrder.vehicle.plate}`
        : `Orden #${workOrder.id}`;

    const handleDelete = () => {
        router.delete(`${workOrdersIndexPath}/${workOrder.id}`, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        Eliminar orden «{title}»
                    </DialogTitle>
                    <DialogDescription>
                        ¿Está seguro de eliminar esta orden de trabajo? Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-wrap gap-2 sm:justify-end sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleting}
                        className="cursor-pointer min-w-0 flex-1 sm:flex-none"
                    >
                        Cancelar
                    </Button>
                    <Button
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
