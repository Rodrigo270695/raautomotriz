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
import type { Role } from '@/types';

const RequiredAsterisk = () => <span className="text-destructive" aria-hidden>*</span>;

type RoleFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: Role | null;
    rolesIndexPath: string;
};

export function RoleFormModal({ open, onOpenChange, role, rolesIndexPath }: RoleFormModalProps) {
    const isEdit = Boolean(role?.id);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: role?.name ?? '',
    });

    const canSubmit = data.name.trim() !== '';

    useEffect(() => {
        if (open) setData('name', role?.name ?? '');
    }, [open, role?.id, role?.name]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && role) {
            put(`${rolesIndexPath}/${role.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(rolesIndexPath, {
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
                        {isEdit ? 'Editar rol' : 'Nuevo rol'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit ? 'Modifique el nombre del rol.' : 'Indique el nombre del nuevo rol.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-name" className="text-foreground">
                            Nombre del rol <RequiredAsterisk />
                        </Label>
                        <Input
                            id="role-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="ej. Supervisor"
                            className="border-content-border focus-visible:ring-(--sidebar-accent)"
                            autoFocus
                            autoComplete="off"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
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
