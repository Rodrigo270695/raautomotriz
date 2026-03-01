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

type PhotoItem = {
    id: number;
    type: string;
    caption: string | null;
    url: string;
    path?: string;
};

type DeletePhotoDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    photo: PhotoItem | null;
    deleteUrl: string | null;
    typeLabel?: string;
};

export function DeletePhotoDialog({
    open,
    onOpenChange,
    photo,
    deleteUrl,
    typeLabel,
}: DeletePhotoDialogProps) {
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const offStart = router.on('start', () => setDeleting(true));
        const offFinish = router.on('finish', () => setDeleting(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    if (!photo || !deleteUrl) return null;

    const handleDelete = () => {
        router.delete(deleteUrl, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        Eliminar foto
                    </DialogTitle>
                    <DialogDescription>
                        ¿Está seguro de eliminar esta foto{typeLabel ? ` (${typeLabel})` : ''}?
                        {photo.caption && (
                            <span className="mt-1 block text-muted-foreground">
                                «{photo.caption.length > 60 ? photo.caption.slice(0, 60) + '…' : photo.caption}»
                            </span>
                        )}
                        Esta acción no se puede deshacer.
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
