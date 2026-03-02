import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { User } from '@/types';
import { RequiredAsterisk } from '@/components/form/RequiredAsterisk';
import { DOCUMENT_TYPES } from '@/lib/documentUtils';

type ClientFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: User | null;
    clientsIndexPath: string;
};

export function ClientFormModal({ open, onOpenChange, client, clientsIndexPath }: ClientFormModalProps) {
    const isEdit = Boolean(client?.id);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: client?.first_name ?? '',
        last_name: client?.last_name ?? '',
        document_type: client?.document_type ?? 'dni',
        document_number: client?.document_number ?? '',
        email: client?.email ?? '',
        phone: client?.phone ?? '',
        status: client?.status ?? 'active',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (open) {
            setData({
                first_name: client?.first_name ?? '',
                last_name: client?.last_name ?? '',
                document_type: client?.document_type ?? 'dni',
                document_number: client?.document_number ?? '',
                email: client?.email ?? '',
                phone: client?.phone ?? '',
                status: client?.status ?? 'active',
                password: '',
                password_confirmation: '',
            });
        }
    }, [open, client?.id, client?.first_name, client?.last_name, client?.document_type, client?.document_number, client?.email, client?.phone, client?.status]);

    const requiredBaseFilled =
        data.first_name.trim() !== '' &&
        data.last_name.trim() !== '' &&
        data.document_type.trim() !== '' &&
        data.document_number.trim() !== '' &&
        data.phone.trim() !== '';
    const passwordRequiredFilled = !isEdit
        ? data.password.trim() !== '' && data.password_confirmation.trim() !== ''
        : true;
    const canSubmit = requiredBaseFilled && passwordRequiredFilled;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && client) {
            put(`${clientsIndexPath}/${client.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(clientsIndexPath, {
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
                        {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit ? 'Modifique los datos del cliente.' : 'Indique los datos del nuevo cliente.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="client-first_name" className="text-foreground">
                                Nombre <RequiredAsterisk />
                            </Label>
                            <Input
                                id="client-first_name"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                placeholder="Ej. Juan"
                                className="border-content-border focus-visible:ring-(--sidebar-accent)"
                                autoFocus={!isEdit}
                                autoComplete="given-name"
                            />
                            {errors.first_name && (
                                <p className="text-sm text-destructive">{errors.first_name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client-last_name" className="text-foreground">
                                Apellido <RequiredAsterisk />
                            </Label>
                            <Input
                                id="client-last_name"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                placeholder="Ej. Pérez"
                                className="border-content-border focus-visible:ring-(--sidebar-accent)"
                                autoComplete="family-name"
                            />
                            {errors.last_name && (
                                <p className="text-sm text-destructive">{errors.last_name}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="client-document_type" className="text-foreground">
                                Tipo de documento <RequiredAsterisk />
                            </Label>
                            <Select
                                value={data.document_type}
                                onValueChange={(v) => {
                                    setData('document_type', v);
                                    if (v === 'dni') {
                                        setData('document_number', (data.document_number ?? '').replace(/\D/g, '').slice(0, 8));
                                    } else if (v === 'ruc') {
                                        setData('document_number', (data.document_number ?? '').replace(/\D/g, '').slice(0, 11));
                                    }
                                }}
                            >
                                <SelectTrigger id="client-document_type" className="border-content-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.document_type && (
                                <p className="text-sm text-destructive">{errors.document_type}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client-document_number" className="text-foreground">
                                Número de documento <RequiredAsterisk />
                            </Label>
                            <div className="relative">
                                <Input
                                    id="client-document_number"
                                    value={data.document_number}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (data.document_type === 'dni') {
                                            setData('document_number', raw.replace(/\D/g, '').slice(0, 8));
                                        } else if (data.document_type === 'ruc') {
                                            setData('document_number', raw.replace(/\D/g, '').slice(0, 11));
                                        } else {
                                            setData('document_number', raw.slice(0, 20));
                                        }
                                    }}
                                    placeholder={
                                        data.document_type === 'dni' ? '8 dígitos' : data.document_type === 'ruc' ? '11 dígitos' : 'Ej. 12345678'
                                    }
                                    className={`border-content-border focus-visible:ring-(--sidebar-accent) ${data.document_type === 'dni' || data.document_type === 'ruc' ? 'pr-11' : ''}`}
                                    autoComplete="off"
                                    inputMode={data.document_type === 'dni' || data.document_type === 'ruc' ? 'numeric' : 'text'}
                                    maxLength={data.document_type === 'dni' ? 8 : data.document_type === 'ruc' ? 11 : 20}
                                />
                                {data.document_type === 'dni' && (
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs tabular-nums"
                                        aria-hidden
                                    >
                                        {data.document_number.length}/8
                                    </span>
                                )}
                                {data.document_type === 'ruc' && (
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs tabular-nums"
                                        aria-hidden
                                    >
                                        {data.document_number.length}/11
                                    </span>
                                )}
                            </div>
                            {errors.document_number && (
                                <p className="text-sm text-destructive">{errors.document_number}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-email" className="text-foreground">
                            Correo
                            <span className="ml-1 text-xs text-muted-foreground font-normal">(opcional)</span>
                        </Label>
                        <Input
                            id="client-email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="border-content-border focus-visible:ring-(--sidebar-accent)"
                            autoComplete="email"
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-phone" className="text-foreground">
                            Celular <RequiredAsterisk />
                        </Label>
                        <div className="relative">
                            <Input
                                id="client-phone"
                                type="tel"
                                inputMode="numeric"
                                value={data.phone}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
                                    const normalized = raw.length > 0 && raw[0] !== '9' ? '9' + raw.slice(1) : raw;
                                    setData('phone', normalized);
                                }}
                                placeholder="9 dígitos (empieza por 9)"
                                className="border-content-border focus-visible:ring-(--sidebar-accent) pr-11"
                                autoComplete="tel"
                                maxLength={9}
                            />
                            <span
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs tabular-nums"
                                aria-hidden
                            >
                                {data.phone.length}/9
                            </span>
                        </div>
                        {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="client-password" className="text-foreground">
                                Contraseña {!isEdit && <RequiredAsterisk />} {isEdit && '(dejar en blanco para no cambiar)'}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="client-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={isEdit ? '••••••••' : 'Mín. 8 caracteres'}
                                    className="border-content-border focus-visible:ring-(--sidebar-accent) pr-10"
                                    autoComplete={isEdit ? 'new-password' : 'new-password'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4" aria-hidden />
                                    ) : (
                                        <Eye className="size-4" aria-hidden />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client-password_confirmation" className="text-foreground">
                                Confirmar contraseña {!isEdit && <RequiredAsterisk />}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="client-password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Repetir contraseña"
                                    className="border-content-border focus-visible:ring-(--sidebar-accent) pr-10"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                                    aria-label={showPasswordConfirmation ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeOff className="size-4" aria-hidden />
                                    ) : (
                                        <Eye className="size-4" aria-hidden />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                            id="client-status"
                            checked={data.status === 'active'}
                            onCheckedChange={(checked) =>
                                setData('status', checked === true ? 'active' : 'inactive')
                            }
                            className="border-content-border"
                        />
                        <Label
                            htmlFor="client-status"
                            className="text-foreground cursor-pointer text-sm font-normal"
                        >
                            Estado activo
                        </Label>
                        {errors.status && (
                            <p className="text-sm text-destructive ml-2">{errors.status}</p>
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
