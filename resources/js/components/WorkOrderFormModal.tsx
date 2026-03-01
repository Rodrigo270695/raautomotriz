import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import ReactSelect from 'react-select';
import type { WorkOrder } from '@/types';

const PERU_TZ = 'America/Lima';

/** Normaliza a yyyy-MM-dd para input type="date" (evita ISO completo que da error en el DOM). */
function toDateOnly(value: string | undefined | null): string {
    if (value == null || value === '') return '';
    const part = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(part) ? part : value;
}

/** Normaliza a hh:mm para input type="time" (HH:mm o HH:mm:ss). */
function toTimeOnly(value: string | undefined | null): string {
    if (value == null || value === '') return '';
    const part = value.slice(0, 5);
    return /^\d{1,2}:\d{2}$/.test(part) ? part : value;
}

/** Fecha y hora actual en zona horaria de Perú (formato para inputs date y time). */
function getPeruNow(): { date: string; time: string } {
    const now = new Date();
    const date = now.toLocaleDateString('en-CA', { timeZone: PERU_TZ });
    const time = now.toLocaleTimeString('en-GB', {
        timeZone: PERU_TZ,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    return { date, time };
}

const STATUS_OPTIONS = [
    { value: 'ingreso', label: 'Ingreso' },
    { value: 'en_checklist', label: 'En checklist' },
    { value: 'diagnosticado', label: 'Diagnosticado' },
    { value: 'en_reparacion', label: 'En reparación' },
    { value: 'listo_para_entregar', label: 'Listo para entregar' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' },
];

type WorkOrderFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workOrder?: WorkOrder | null;
    workOrdersIndexPath: string;
    vehicles: Array<{ id: number; plate: string; vehicle_model_id: number | null; client_id: number; vehicle_model?: { id: number; name: string } }>;
    clients: Array<{ id: number; first_name: string; last_name: string; document_number?: string | null }>;
};

export function WorkOrderFormModal({
    open,
    onOpenChange,
    workOrder,
    workOrdersIndexPath,
    vehicles,
    clients,
}: WorkOrderFormModalProps) {
    const isEdit = Boolean(workOrder?.id);
    const pageErrors = (usePage().props as { errors?: Record<string, string> }).errors ?? {};
    const [data, setData] = useState({
        vehicle_id: workOrder?.vehicle_id ?? 0,
        client_id: workOrder?.client_id ?? 0,
        entry_date: toDateOnly(workOrder?.entry_date) || new Date().toISOString().slice(0, 10),
        entry_time: toTimeOnly(workOrder?.entry_time) || '08:00',
        entry_mileage: workOrder?.entry_mileage != null ? String(workOrder.entry_mileage) : '',
        exit_mileage: workOrder?.exit_mileage != null ? String(workOrder.exit_mileage) : '',
        client_observation: workOrder?.client_observation ?? '',
        diagnosis: workOrder?.diagnosis ?? '',
        status: (workOrder?.status as string) ?? 'ingreso',
        advance_payment_amount: workOrder?.advance_payment_amount != null ? String(workOrder.advance_payment_amount) : '0',
        total_amount: workOrder?.total_amount != null ? String(workOrder.total_amount) : '0',
        notes: workOrder?.notes ?? '',
    });
    const [processing, setProcessing] = useState(false);

    const canSubmit =
        Number(data.client_id) > 0 &&
        Number(data.vehicle_id) > 0 &&
        data.entry_date.trim() !== '' &&
        data.entry_time.trim() !== '' &&
        data.status.trim() !== '';

    useEffect(() => {
        if (open) {
            const peru = getPeruNow();
            const isNew = !workOrder?.id;
            setData({
                vehicle_id: workOrder?.vehicle_id ?? 0,
                client_id: workOrder?.client_id ?? 0,
                entry_date: toDateOnly(workOrder?.entry_date) || (isNew ? peru.date : new Date().toISOString().slice(0, 10)),
                entry_time: toTimeOnly(workOrder?.entry_time) || (isNew ? peru.time : '08:00'),
                entry_mileage: workOrder?.entry_mileage != null ? String(workOrder.entry_mileage) : '',
                exit_mileage: workOrder?.exit_mileage != null ? String(workOrder.exit_mileage) : '',
                client_observation: workOrder?.client_observation ?? '',
                diagnosis: workOrder?.diagnosis ?? '',
                status: (workOrder?.status as string) ?? 'ingreso',
                advance_payment_amount: workOrder?.advance_payment_amount != null ? String(workOrder.advance_payment_amount) : '0',
                total_amount: workOrder?.total_amount != null ? String(workOrder.total_amount) : '0',
                notes: workOrder?.notes ?? '',
            });
        }
    }, [open, workOrder?.id, workOrder?.vehicle_id, workOrder?.client_id, workOrder?.entry_date, workOrder?.entry_time, workOrder?.entry_mileage, workOrder?.exit_mileage, workOrder?.client_observation, workOrder?.diagnosis, workOrder?.status, workOrder?.advance_payment_amount, workOrder?.total_amount, workOrder?.notes]);

    // Radix Dialog pone pointer-events: none fuera del contenido; el menú del select está en body y no recibe clics.
    // Restaurar pointer-events en body mientras el modal está abierto para que los dropdowns portaleados funcionen.
    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            document.body.style.pointerEvents = '';
        }, 0);
        return () => {
            clearTimeout(timer);
            document.body.style.pointerEvents = 'auto';
        };
    }, [open]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            vehicle_id: Number(data.vehicle_id),
            client_id: Number(data.client_id),
            entry_date: data.entry_date,
            entry_time: data.entry_time,
            entry_mileage: data.entry_mileage === '' ? null : Number(data.entry_mileage),
            exit_mileage: data.exit_mileage === '' ? null : Number(data.exit_mileage),
            client_observation: data.client_observation || null,
            diagnosis: data.diagnosis || null,
            status: data.status,
            advance_payment_amount: data.advance_payment_amount === '' ? 0 : Number(data.advance_payment_amount),
            total_amount: data.total_amount === '' ? 0 : Number(data.total_amount),
            notes: data.notes || null,
        };
        setProcessing(true);
        if (isEdit && workOrder) {
            router.put(`${workOrdersIndexPath}/${workOrder.id}`, payload, {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => onOpenChange(false),
            });
        } else {
            router.post(workOrdersIndexPath, payload, {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => onOpenChange(false),
            });
        }
    };

    const vehiclesByClient = (vehicles ?? []).filter(
        (v) => Number((v as { client_id?: number }).client_id) === Number(data.client_id)
    );
    const vehicleOptions = vehiclesByClient.map((v) => ({
        id: v.id,
        label: (v as { vehicle_model?: { name: string } }).vehicle_model ? `${v.plate} — ${(v as { vehicle_model: { name: string } }).vehicle_model.name}` : v.plate,
    }));
    type ClientSelectOption = {
        value: string;
        label: string;
        document_number?: string | null;
        first_name?: string;
        last_name?: string;
    };
    const getClientSearchText = (opt: ClientSelectOption) =>
        [opt.label, opt.first_name, opt.last_name, opt.document_number]
            .filter(Boolean)
            .join(' ')
            .trim()
            .toLowerCase();
    const clientSelectOptions = useMemo<ClientSelectOption[]>(
        () =>
            (clients ?? []).map((c) => ({
                value: String(c.id),
                label: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || `Usuario #${c.id}`,
                document_number: c.document_number ?? undefined,
                first_name: c.first_name,
                last_name: c.last_name,
            })),
        [clients]
    );
    const clientSelectValue = useMemo(
        () => clientSelectOptions.find((o) => o.value === String(data.client_id)) ?? null,
        [clientSelectOptions, data.client_id]
    );

    const handleClientChange = (opt: ClientSelectOption | null) => {
        const clientId = opt?.value ? Number(opt.value) : 0;
        setData((prev) => ({ ...prev, client_id: clientId, vehicle_id: 0 }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="border-content-border bg-card w-[calc(100%-1rem)] max-w-lg sm:w-full max-h-[90vh] overflow-y-auto"
                onPointerDownOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[role="listbox"]') ?? target.closest('[class*="Menu"]')) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isEdit ? 'Editar orden de trabajo' : 'Nueva orden de trabajo'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit ? 'Modifique los datos de la orden.' : 'Complete los datos de la nueva orden.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="wo-client_id" className="text-foreground">
                            Cliente <span className="text-destructive">*</span>
                        </Label>
                        <ReactSelect<ClientSelectOption>
                            inputId="wo-client_id"
                            value={clientSelectValue}
                            onChange={handleClientChange}
                            options={clientSelectOptions}
                            placeholder="Buscar por nombre o documento…"
                            noOptionsMessage={() => 'No hay coincidencias'}
                            isClearable
                            filterOption={(option, input) => {
                                const query = input.trim().toLowerCase();
                                if (!query) return true;
                                const searchText = getClientSearchText(option);
                                return query.split(/\s+/).every((word) => searchText.includes(word));
                            }}
                            formatOptionLabel={(opt, meta) => {
                                const doc = opt.document_number != null && opt.document_number !== '' ? opt.document_number : '';
                                const oneLine = doc ? `${opt.label} - ${doc}` : opt.label;
                                if (meta?.context === 'value') {
                                    return oneLine;
                                }
                                return (
                                    <div className="pointer-events-none flex flex-col gap-0.5">
                                        <span>{opt.label}</span>
                                        {doc ? (
                                            <span className="text-muted-foreground text-xs">Doc: {doc}</span>
                                        ) : null}
                                    </div>
                                );
                            }}
                            classNames={{
                                control: () =>
                                    '!min-h-9 !max-h-9 !rounded-md !border-content-border !border !bg-transparent !shadow-xs !text-xs sm:!text-sm',
                                valueContainer: () => '!py-0',
                                singleValue: () => '!leading-9 !m-0 !text-xs sm:!text-sm',
                                placeholder: () => '!text-muted-foreground !text-xs sm:!text-sm',
                                menuPortal: () => 'z-[10050] pointer-events-auto',
                                menu: () =>
                                    '!rounded-md !border !border-content-border !bg-popover !text-popover-foreground !shadow-lg',
                                option: () => '!text-xs sm:!text-sm',
                                input: () => '!text-xs sm:!text-sm',
                            }}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                            menuPosition="fixed"
                            styles={{
                                control: (base) => ({ ...base, minHeight: 36, maxHeight: 36 }),
                                input: (base) => ({ ...base, margin: 0, padding: 0 }),
                                menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
                            }}
                        />
                        {pageErrors.client_id && (
                            <p className="text-sm text-destructive">{pageErrors.client_id}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-vehicle_id" className="text-foreground">
                            Vehículo <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.client_id && data.vehicle_id ? String(data.vehicle_id) : ''}
                            onValueChange={(val) => setData((prev) => ({ ...prev, vehicle_id: val ? Number(val) : 0 }))}
                            disabled={!data.client_id}
                        >
                            <SelectTrigger
                                id="wo-vehicle_id"
                                className="border-content-border disabled:opacity-60"
                            >
                                <SelectValue
                                    placeholder={
                                        data.client_id
                                            ? 'Seleccione vehículo'
                                            : 'Primero seleccione un cliente'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {vehicleOptions.map((opt) => (
                                    <SelectItem key={opt.id} value={String(opt.id)}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {pageErrors.vehicle_id && (
                            <p className="text-sm text-destructive">{pageErrors.vehicle_id}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="wo-entry_date" className="text-foreground">
                                Fecha de ingreso <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="wo-entry_date"
                                type="date"
                                value={toDateOnly(data.entry_date) || ''}
                                onChange={(e) => setData((prev) => ({ ...prev, entry_date: e.target.value }))}
                                className="border-content-border"
                            />
                            {pageErrors.entry_date && (
                                <p className="text-sm text-destructive">{pageErrors.entry_date}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wo-entry_time" className="text-foreground">
                                Hora de ingreso <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="wo-entry_time"
                                type="time"
                                value={toTimeOnly(data.entry_time) || ''}
                                onChange={(e) => setData((prev) => ({ ...prev, entry_time: e.target.value }))}
                                className="border-content-border"
                            />
                            {pageErrors.entry_time && (
                                <p className="text-sm text-destructive">{pageErrors.entry_time}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="wo-entry_mileage" className="text-foreground">
                                Kilometraje ingreso
                            </Label>
                            <Input
                                id="wo-entry_mileage"
                                type="number"
                                min={0}
                                value={data.entry_mileage ?? ''}
                                onChange={(e) => setData((prev) => ({ ...prev, entry_mileage: e.target.value }))}
                                placeholder="—"
                                className="border-content-border"
                            />
                            {pageErrors.entry_mileage && (
                                <p className="text-sm text-destructive">{pageErrors.entry_mileage}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="wo-status" className="text-foreground">
                                Estado <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.status ?? 'ingreso'}
                                onValueChange={(val) => setData((prev) => ({ ...prev, status: val ?? 'ingreso' }))}
                            >
                                <SelectTrigger id="wo-status" className="border-content-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {pageErrors.status && (
                                <p className="text-sm text-destructive">{pageErrors.status}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-client_observation" className="text-foreground">
                            Observación del cliente
                        </Label>
                        <Input
                            id="wo-client_observation"
                            value={data.client_observation ?? ''}
                            onChange={(e) => setData((prev) => ({ ...prev, client_observation: e.target.value }))}
                            placeholder="Qué reporta el cliente"
                            className="border-content-border"
                        />
                        {pageErrors.client_observation && (
                            <p className="text-sm text-destructive">{pageErrors.client_observation}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-diagnosis" className="text-foreground">
                            Diagnóstico
                        </Label>
                        <Input
                            id="wo-diagnosis"
                            value={data.diagnosis ?? ''}
                            onChange={(e) => setData((prev) => ({ ...prev, diagnosis: e.target.value }))}
                            placeholder="Diagnóstico técnico"
                            className="border-content-border"
                        />
                        {pageErrors.diagnosis && (
                            <p className="text-sm text-destructive">{pageErrors.diagnosis}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-advance_payment_amount" className="text-foreground">
                            Adelanto
                        </Label>
                        <Input
                            id="wo-advance_payment_amount"
                            type="number"
                            min={0}
                            step={0.01}
                            value={data.advance_payment_amount ?? '0'}
                            onChange={(e) => setData((prev) => ({ ...prev, advance_payment_amount: e.target.value }))}
                            className="border-content-border"
                        />
                        {pageErrors.advance_payment_amount && (
                            <p className="text-sm text-destructive">{pageErrors.advance_payment_amount}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-notes" className="text-foreground">
                            Notas internas
                        </Label>
                        <Input
                            id="wo-notes"
                            value={data.notes ?? ''}
                            onChange={(e) => setData((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Notas del taller"
                            className="border-content-border"
                        />
                        {pageErrors.notes && (
                            <p className="text-sm text-destructive">{pageErrors.notes}</p>
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
