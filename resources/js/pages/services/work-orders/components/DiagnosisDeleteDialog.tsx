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
import type { WorkOrderDiagnosisItem } from '../types';

type DiagnosisDeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    diagnosis: WorkOrderDiagnosisItem | null;
    diagnosesBasePath: string;
};

export function DiagnosisDeleteDialog({
    open,
    onOpenChange,
    diagnosis,
    diagnosesBasePath,
}: DiagnosisDeleteDialogProps) {
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const offStart = router.on('start', () => setDeleting(true));
        const offFinish = router.on('finish', () => setDeleting(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    if (!diagnosis || !diagnosesBasePath) return null;

    const handleDelete = () => {
        router.delete(`${diagnosesBasePath}/${diagnosis.id}`, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Eliminar diagnóstico</DialogTitle>
                    <DialogDescription>
                        ¿Eliminar este diagnóstico? Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                {diagnosis.diagnosis_text && (
                    <p className="text-muted-foreground text-sm line-clamp-3 rounded-md border border-content-border bg-content-muted/30 p-2">
                        {diagnosis.diagnosis_text}
                    </p>
                )}
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleting}
                        className="cursor-pointer border-content-border"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="cursor-pointer"
                    >
                        {deleting ? 'Eliminando…' : 'Eliminar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
