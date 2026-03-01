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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import type { ServiceChecklist } from '@/types';

type ServiceChecklistFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    checklist?: ServiceChecklist | null;
    checklistsIndexPath: string;
    /** Siguiente número de orden al crear (max + 1). Se rellena automáticamente al abrir el modal de nueva lista. */
    nextOrderNumber?: number;
};

export function ServiceChecklistFormModal({
    open,
    onOpenChange,
    checklist,
    checklistsIndexPath,
    nextOrderNumber = 1,
}: ServiceChecklistFormModalProps) {
    const isEdit = Boolean(checklist?.id);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        order_number: checklist?.order_number ?? nextOrderNumber,
        name: checklist?.name ?? '',
        description: checklist?.description ?? '',
        status: (checklist?.status as 'active' | 'inactive') ?? 'active',
    });

    const hasOrderNumber = data.order_number !== '' && data.order_number != null;
    const canSubmit = hasOrderNumber && data.name.trim() !== '';

    useEffect(() => {
        if (open) {
            const order = isEdit
                ? (checklist?.status === 'active' ? (checklist?.order_number ?? '') : '')
                : nextOrderNumber;
            setData('order_number', order);
            setData('name', (checklist?.name ?? '').toUpperCase());
            setData('description', checklist?.description ?? '');
            setData('status', (checklist?.status as 'active' | 'inactive') ?? 'active');
        }
    }, [open, isEdit, checklist?.id, checklist?.order_number, checklist?.name, checklist?.description, checklist?.status, nextOrderNumber]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && checklist) {
            put(`${checklistsIndexPath}/${checklist.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(checklistsIndexPath, {
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
                        {isEdit ? 'Editar lista de chequeo' : 'Nueva lista de chequeo'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit
                            ? 'Modifique los datos de la lista de chequeo.'
                            : 'Complete los datos de la nueva lista de chequeo.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="checklist-order_number" className="text-foreground">
                            Número de orden <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="checklist-order_number"
                            type="number"
                            min={1}
                            readOnly
                            value={data.order_number === '' ? '' : data.order_number}
                            className="border-content-border bg-muted/50 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                            tabIndex={-1}
                            aria-readonly="true"
                        />
                        {errors.order_number && (
                            <p className="text-sm text-destructive">{errors.order_number}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="checklist-name" className="text-foreground">
                            Nombre <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="checklist-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value.toUpperCase())}
                            placeholder="ej. REVISIÓN PRE-ENTREGA"
                            className="border-content-border focus-visible:ring-(--sidebar-accent)"
                            autoFocus
                            autoComplete="off"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="checklist-description" className="text-foreground">
                            Descripción
                        </Label>
                        <Input
                            id="checklist-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Breve descripción"
                            className="border-content-border focus-visible:ring-(--sidebar-accent)"
                            autoComplete="off"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-foreground">Estado</Label>
                        <div className="flex items-center gap-2 pt-1">
                            <Checkbox
                                id="checklist-status"
                                checked={data.status === 'active'}
                                onCheckedChange={(checked) => {
                                    const newStatus = checked === true ? 'active' : 'inactive';
                                    setData('status', newStatus);
                                    if (newStatus === 'active' && (data.order_number === '' || data.order_number == null)) {
                                        setData('order_number', nextOrderNumber);
                                    }
                                }}
                                aria-describedby={errors.status ? 'checklist-status-error' : undefined}
                            />
                            <label
                                htmlFor="checklist-status"
                                className="text-sm font-medium text-foreground cursor-pointer leading-none"
                            >
                                Activo
                            </label>
                        </div>
                        {errors.status && (
                            <p id="checklist-status-error" className="text-sm text-destructive">
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
