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
import type { InventoryBrand } from '@/types';

const RequiredAsterisk = () => <span className="text-destructive" aria-hidden>*</span>;

type InventoryBrandFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inventoryBrand?: InventoryBrand | null;
    selectedTypeId: number | null;
    typesIndexPath: string;
};

export function InventoryBrandFormModal({
    open,
    onOpenChange,
    inventoryBrand,
    selectedTypeId,
    typesIndexPath,
}: InventoryBrandFormModalProps) {
    const isEdit = Boolean(inventoryBrand?.id);
    const basePath = typesIndexPath.replace(/\/$/, '');
    const brandsBasePath = basePath.replace(/\/types$/, '') + '/brands';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: inventoryBrand?.name ?? '',
        description: (inventoryBrand?.description as string) ?? '',
        status: (inventoryBrand?.status as string) ?? 'active',
        inventory_type_id: inventoryBrand?.inventory_type_id ?? selectedTypeId ?? 0,
    });

    useEffect(() => {
        if (open) {
            setData({
                name: (inventoryBrand?.name ?? '').toUpperCase(),
                description: (inventoryBrand?.description as string) ?? '',
                status: (inventoryBrand?.status as string) ?? 'active',
                inventory_type_id:
                    inventoryBrand?.inventory_type_id ?? selectedTypeId ?? 0,
            });
        }
    }, [
        open,
        inventoryBrand?.id,
        inventoryBrand?.name,
        inventoryBrand?.description,
        inventoryBrand?.status,
        inventoryBrand?.inventory_type_id,
        selectedTypeId,
    ]);

    const hasName = data.name.trim() !== '';
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && inventoryBrand) {
            put(`${brandsBasePath}/${inventoryBrand.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else if (selectedTypeId != null) {
            post(`${basePath}/${selectedTypeId}/brands`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    const canSubmit = (isEdit || selectedTypeId != null) && hasName;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isEdit ? 'Editar marca' : 'Nueva marca'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit
                            ? 'Modifique los datos de la marca.'
                            : 'Indique los datos de la nueva marca.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="brand-name" className="text-foreground">
                            Nombre <RequiredAsterisk />
                        </Label>
                        <Input
                            id="brand-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value.toUpperCase())}
                            placeholder="ej. FILTROS"
                            className="border-content-border"
                            autoFocus
                            autoComplete="off"
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="brand-description" className="text-foreground">
                            Descripción
                        </Label>
                        <Input
                            id="brand-description"
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
                                id="brand-status"
                                checked={data.status === 'active'}
                                onCheckedChange={(checked) =>
                                    setData('status', checked === true ? 'active' : 'inactive')
                                }
                                className="border-content-border"
                            />
                            <Label
                                htmlFor="brand-status"
                                className="text-foreground cursor-pointer font-normal"
                            >
                                Activo
                            </Label>
                        </div>
                        {errors.status && (
                            <p className="text-sm text-destructive">{errors.status}</p>
                        )}
                    </div>
                    {!isEdit && selectedTypeId == null && (
                        <p className="text-sm text-muted-foreground">
                            Seleccione un tipo para agregar una marca.
                        </p>
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
