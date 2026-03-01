import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ServicePackage } from '@/types';

type ServicePackageFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    package: ServicePackage | null;
    packagesIndexPath: string;
    serviceTypesForSelect: Array<{ id: number; name: string }>;
    nextSortOrder: number;
};

export function ServicePackageFormModal({
    open,
    onOpenChange,
    package: pkg,
    packagesIndexPath,
    serviceTypesForSelect,
    nextSortOrder,
}: ServicePackageFormModalProps) {
    const isEdit = Boolean(pkg?.id);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: pkg?.name ?? '',
        description: pkg?.description ?? '',
        service_type_id: pkg?.service_type_id ?? '',
        status: (pkg?.status as 'active' | 'inactive') ?? 'active',
        sort_order: String(pkg?.sort_order ?? nextSortOrder),
    });

    const canSubmit =
        data.name.trim() !== '' &&
        Boolean(data.service_type_id);

    useEffect(() => {
        if (open) {
            setData({
                name: pkg?.name ?? '',
                description: pkg?.description ?? '',
                service_type_id: pkg?.service_type_id ?? (serviceTypesForSelect[0]?.id ?? ''),
                status: (pkg?.status as 'active' | 'inactive') ?? 'active',
                sort_order: String(pkg?.sort_order ?? nextSortOrder),
            });
        }
    }, [open, pkg, serviceTypesForSelect, nextSortOrder, setData]);

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            reset();
        }
        onOpenChange(nextOpen);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && pkg) {
            put(`${packagesIndexPath}/${pkg.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(packagesIndexPath, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isEdit ? 'Editar paquete de servicio' : 'Nuevo paquete de servicio'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit
                            ? 'Modifique los datos del paquete.'
                            : 'Complete los datos del nuevo paquete de servicio.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pkg-name" className="text-foreground">
                            Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="pkg-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value.toUpperCase())}
                            placeholder="ej. Preventivo – Cambio de aceite"
                            className="border-content-border focus-visible:ring-(--sidebar-accent)"
                            autoFocus
                            autoComplete="off"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pkg-description" className="text-foreground">
                            Descripción
                        </Label>
                        <Input
                            id="pkg-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Breve descripción del paquete"
                            className="border-content-border focus-visible:ring-(--sidebar-accent)"
                            autoComplete="off"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pkg-service-type" className="text-foreground">
                            Tipo de servicio <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.service_type_id ? String(data.service_type_id) : ''}
                            onValueChange={(v) => setData('service_type_id', v)}
                        >
                            <SelectTrigger id="pkg-service-type" className="border-content-border">
                                <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {serviceTypesForSelect.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.service_type_id && (
                            <p className="text-sm text-destructive">{errors.service_type_id}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pkg-sort-order" className="text-foreground">
                            Orden
                        </Label>
                        <Input
                            id="pkg-sort-order"
                            type="number"
                            min={0}
                            value={data.sort_order}
                            readOnly
                            disabled
                            className="border-content-border focus-visible:ring-(--sidebar-accent)"
                            autoComplete="off"
                        />
                        {errors.sort_order && (
                            <p className="text-sm text-destructive">{errors.sort_order}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-foreground">Estado</Label>
                        <div className="flex items-center gap-2 pt-1">
                            <Checkbox
                                id="pkg-status"
                                checked={data.status === 'active'}
                                onCheckedChange={(checked) =>
                                    setData('status', checked === true ? 'active' : 'inactive')
                                }
                                aria-describedby={errors.status ? 'pkg-status-error' : undefined}
                            />
                            <label
                                htmlFor="pkg-status"
                                className="text-sm font-medium text-foreground cursor-pointer leading-none"
                            >
                                Activo
                            </label>
                        </div>
                        {errors.status && (
                            <p id="pkg-status-error" className="text-sm text-destructive">
                                {errors.status}
                            </p>
                        )}
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
