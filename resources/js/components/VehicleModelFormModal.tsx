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
import type { VehicleModel } from '@/types';

const RequiredAsterisk = () => <span className="text-destructive" aria-hidden>*</span>;

type VehicleModelFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicleModel?: VehicleModel | null;
    selectedBrandId: number | null;
    brandsIndexPath: string;
};

export function VehicleModelFormModal({
    open,
    onOpenChange,
    vehicleModel,
    selectedBrandId,
    brandsIndexPath,
}: VehicleModelFormModalProps) {
    const isEdit = Boolean(vehicleModel?.id);
    const basePath = brandsIndexPath.replace(/\/$/, '');
    const modelUpdatePath = basePath.replace(/\/brands$/, '') + '/models/' + (vehicleModel?.id ?? '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: vehicleModel?.name ?? '',
        description: (vehicleModel?.description as string) ?? '',
        status: (vehicleModel?.status as string) ?? 'active',
        brand_id: vehicleModel?.brand_id ?? selectedBrandId ?? 0,
    });

    useEffect(() => {
        if (open) {
            setData({
                name: (vehicleModel?.name ?? '').toUpperCase(),
                description: (vehicleModel?.description as string) ?? '',
                status: (vehicleModel?.status as string) ?? 'active',
                brand_id: vehicleModel?.brand_id ?? selectedBrandId ?? 0,
            });
        }
    }, [open, vehicleModel?.id, vehicleModel?.name, vehicleModel?.description, vehicleModel?.status, vehicleModel?.brand_id, selectedBrandId]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && vehicleModel) {
            put(modelUpdatePath, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else if (selectedBrandId != null) {
            post(`${basePath}/${selectedBrandId}/models`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    const hasName = data.name.trim() !== '';
    const canSubmit = (isEdit || selectedBrandId != null) && hasName;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isEdit ? 'Editar modelo' : 'Nuevo modelo'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit ? 'Modifique los datos del modelo.' : 'Indique los datos del nuevo modelo.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="model-name" className="text-foreground">
                            Nombre <RequiredAsterisk />
                        </Label>
                        <Input
                            id="model-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value.toUpperCase())}
                            placeholder="ej. COROLLA"
                            className="border-content-border"
                            autoFocus
                            autoComplete="off"
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model-description" className="text-foreground">
                            Descripción
                        </Label>
                        <Input
                            id="model-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Opcional"
                            className="border-content-border"
                            autoComplete="off"
                        />
                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="model-status"
                                checked={data.status === 'active'}
                                onCheckedChange={(checked) =>
                                    setData('status', checked === true ? 'active' : 'inactive')
                                }
                                className="border-content-border"
                            />
                            <Label
                                htmlFor="model-status"
                                className="text-foreground cursor-pointer font-normal"
                            >
                                Activo
                            </Label>
                        </div>
                        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                    </div>
                    {!isEdit && selectedBrandId == null && (
                        <p className="text-sm text-muted-foreground">Seleccione una marca para agregar un modelo.</p>
                    )}
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
