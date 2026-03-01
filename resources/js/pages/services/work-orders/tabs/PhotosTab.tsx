import React, { useState } from 'react';
import { FileText, ImagePlus, LayoutGrid, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DeletePhotoDialog } from '@/components/DeletePhotoDialog';
import { PhotoUploadModal } from '../components/PhotoUploadModal';
import type { PhotoType, WorkOrderPhotoItem, WorkOrderShowCan } from '../types';
import { isVideoUrl } from '../utils';

type PhotosTabProps = {
    photos: WorkOrderPhotoItem[];
    typeLabels: Record<PhotoType, string>;
    photoStats: { total: number; by_type: { entry: number; diagnosis: number; process: number; delivery: number } };
    photosIndexPath: string;
    can: WorkOrderShowCan;
};

export function PhotosTab({ photos, typeLabels, photoStats, photosIndexPath, can }: PhotosTabProps) {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState<WorkOrderPhotoItem | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                    <LayoutGrid className="size-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{photoStats.total}</span> total
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                    Ingreso <span className="font-semibold text-violet-600 dark:text-violet-400">{photoStats.by_type.entry}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                    Diagnóstico/Proceso <span className="font-semibold text-amber-600 dark:text-amber-400">{photoStats.by_type.diagnosis + photoStats.by_type.process}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                    Entrega <span className="font-semibold text-emerald-600 dark:text-emerald-400">{photoStats.by_type.delivery}</span>
                </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                <div className="border-b border-content-border p-3 sm:p-4 flex items-center justify-between gap-2">
                    <h2 className="text-sm font-medium text-foreground">Galería</h2>
                    {can.photos_create && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setUploadModalOpen(true)}
                            className="cursor-pointer bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                        >
                            <ImagePlus className="size-4 mr-1" />
                            <span className="hidden xs:inline">Subir fotos</span>
                            <span className="xs:hidden">Agregar</span>
                        </Button>
                    )}
                </div>
                <div className="p-3 sm:p-4">
                    {photos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-12">
                            <FileText className="size-10 text-muted-foreground/60" aria-hidden />
                            <span className="text-muted-foreground text-sm">No hay fotos en esta orden.</span>
                            {can.photos_create && (
                                <Button
                                    size="sm"
                                    onClick={() => setUploadModalOpen(true)}
                                    className="cursor-pointer mt-1 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                                >
                                    <ImagePlus className="size-4 mr-1" /> Subir primera foto
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {photos.map((photo) => (
                                <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-content-border bg-content-muted/20">
                                    <a href={photo.url} target="_blank" rel="noopener noreferrer" className="block aspect-square w-full">
                                        {isVideoUrl(photo.path || photo.url) ? (
                                            <video src={photo.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                                        ) : (
                                            <img src={photo.url} alt={photo.caption || 'Foto'} className="h-full w-full object-cover" />
                                        )}
                                    </a>
                                    <div className="flex flex-wrap items-center justify-between gap-1 p-2">
                                        <span className="shrink-0 rounded-full bg-content-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            {typeLabels[photo.type as PhotoType] ?? photo.type}
                                        </span>
                                        {can.photos_delete && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 cursor-pointer shrink-0 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                        onClick={() => setPhotoToDelete(photo)}
                                                        aria-label="Eliminar foto"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent variant="destructive">Eliminar</TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                    {photo.caption && <p className="line-clamp-2 px-2 pb-2 text-muted-foreground text-xs">{photo.caption}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <PhotoUploadModal
                open={uploadModalOpen}
                onOpenChange={setUploadModalOpen}
                photosIndexPath={photosIndexPath}
                typeLabels={typeLabels}
            />

            <DeletePhotoDialog
                open={!!photoToDelete}
                onOpenChange={(open) => !open && setPhotoToDelete(null)}
                photo={photoToDelete}
                deleteUrl={photoToDelete ? `${photosIndexPath}/${photoToDelete.id}` : null}
                typeLabel={photoToDelete ? typeLabels[photoToDelete.type as PhotoType] : undefined}
            />
        </div>
    );
}
