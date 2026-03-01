import { useForm } from '@inertiajs/react';
import React, { useRef, useEffect } from 'react';
import { Camera, ImagePlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import type { PhotoType } from '../types';

type PhotoUploadModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    photosIndexPath: string;
    typeLabels: Record<PhotoType, string>;
};

export function PhotoUploadModal({
    open,
    onOpenChange,
    photosIndexPath,
    typeLabels,
}: PhotoUploadModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'entry' as PhotoType,
        caption: '',
        photos: [] as File[],
    });

    useEffect(() => {
        if (open) {
            reset();
            setData({ type: 'entry', caption: '', photos: [] });
        }
        if (!open && fileInputRef.current) fileInputRef.current.value = '';
        if (!open && cameraInputRef.current) cameraInputRef.current.value = '';
    }, [open, reset, setData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        setData('photos', Array.from(files));
        e.target.value = '';
    };
    const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        setData('photos', (prev: File[]) => [...prev, ...Array.from(files)]);
        e.target.value = '';
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.photos.length === 0) return;
        post(photosIndexPath, {
            forceFormData: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
                setData({ type: 'entry', caption: '', photos: [] });
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (cameraInputRef.current) cameraInputRef.current.value = '';
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-lg sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <ImagePlus className="size-5 text-muted-foreground" />
                        Subir fotos o video
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Elige tipo, pie de foto opcional y archivos para subir.
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="modal-photo-type" className="text-muted-foreground text-xs font-medium">Tipo <span className="text-red-500">*</span></Label>
                        <Select value={data.type} onValueChange={(v) => setData('type', v as PhotoType)}>
                            <SelectTrigger id="modal-photo-type" className="border-content-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.entries(typeLabels) as [PhotoType, string][]).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="modal-photo-caption" className="text-muted-foreground text-xs font-medium">Pie de foto</Label>
                        <Input
                            id="modal-photo-caption"
                            className="border-content-border"
                            value={data.caption}
                            onChange={(e) => setData('caption', e.target.value)}
                            placeholder="Descripción"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-muted-foreground text-xs font-medium">Archivos <span className="text-red-500">*</span></Label>
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                                aria-label="Elegir archivos"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-10 cursor-pointer border-content-border"
                                onClick={() => fileInputRef.current?.click()}
                                title="Desde galería o PC"
                            >
                                <ImagePlus className="size-4 mr-1.5 shrink-0" /> Elegir archivos
                            </Button>
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*,video/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleCameraChange}
                                aria-label="Tomar foto o video"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-10 cursor-pointer border-content-border"
                                onClick={() => cameraInputRef.current?.click()}
                                title="En celular abre la cámara"
                            >
                                <Camera className="size-4 mr-1.5 shrink-0" /> Tomar foto o video
                            </Button>
                            {data.photos.length > 0 && (
                                <span className="text-muted-foreground text-sm">{data.photos.length} archivo(s) seleccionado(s)</span>
                            )}
                        </div>
                        {errors.photos && <p className="text-destructive text-xs">{errors.photos}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={data.photos.length === 0 || processing}
                            className="cursor-pointer bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                        >
                            {processing ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Subiendo…
                                </span>
                            ) : (
                                <>
                                    <Upload className="size-4 mr-1.5" />
                                    Subir
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
