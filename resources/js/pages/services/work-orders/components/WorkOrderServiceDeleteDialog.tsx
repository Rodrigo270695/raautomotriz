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
import type { WorkOrderServiceItem } from '../types';

type WorkOrderServiceDeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: WorkOrderServiceItem | null;
    servicesBasePath: string;
};

export function WorkOrderServiceDeleteDialog({
    open,
    onOpenChange,
    service,
    servicesBasePath,
}: WorkOrderServiceDeleteDialogProps) {
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const offStart = router.on('start', () => setDeleting(true));
        const offFinish = router.on('finish', () => setDeleting(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    if (!service || !servicesBasePath) return null;

    const handleDelete = () => {
        router.delete(`${servicesBasePath}/${service.id}`, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    const label =
        service.product_name ??
        service.description ??
        (service.service_package_name ? `Ítem de ${service.service_package_name}` : `Servicio #${service.id}`);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Eliminar servicio</DialogTitle>
                    <DialogDescription>
                        ¿Eliminar este servicio de la orden? Esta acción no se puede deshacer.
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

