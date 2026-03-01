import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { InventoryType } from '@/types';

const RequiredAsterisk = () => <span className="text-destructive" aria-hidden>*</span>;

type InventoryTypeFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type?: InventoryType | null;
    typesIndexPath: string;
};

export function InventoryTypeFormModal({
    open,
    onOpenChange,
    type,
    typesIndexPath,
}: InventoryTypeFormModalProps) {
    const isEdit = Boolean(type?.id);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: type?.name ?? '',
        description: (type?.description as string) ?? '',
        status: (type?.status as string) ?? 'active',
    });

    const canSubmit = data.name.trim() !== '';

    useEffect(() => {
        if (open) {
            setData({
                name: (type?.name ?? '').toUpperCase(),
                description: (type?.description as string) ?? '',
                status: (type?.status as string) ?? 'active',
            });
        }
    }, [open, type?.id, type?.name, type?.description, type?.status]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && type) {
            put(`${typesIndexPath}/${type.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(typesIndexPath, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isEdit ? 'Editar tipo' : 'Nuevo tipo'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit ? 'Modifique los datos del tipo.' : 'Indique los datos del nuevo tipo.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type-name" className="text-foreground">
                            Nombre <RequiredAsterisk />
                        </Label>
                        <Input
                            id="type-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value.toUpperCase())}
                            placeholder="ej. REPUESTOS"
                            className="border-content-border"
                            autoFocus
                            autoComplete="off"
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type-description" className="text-foreground">
                            Descripción
                        </Label>
                        <Input
                            id="type-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Opcional"
                            className="border-content-border"
                            autoComplete="off"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="type-status"
                                checked={data.status === 'active'}
                                onCheckedChange={(checked) =>
                                    setData('status', checked === true ? 'active' : 'inactive')
                                }
                                className="border-content-border"
                            />
                            <Label
                                htmlFor="type-status"
                                className="text-foreground cursor-pointer font-normal"
                            >
                                Activo
                            </Label>
                        </div>
                        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
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
                            {processing ? 'Guardando…' : isEdit ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
