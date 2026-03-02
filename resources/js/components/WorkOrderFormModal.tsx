import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AsyncSelect from 'react-select/async';
import type { WorkOrder } from '@/types';
import { WORK_ORDER_STATUS_OPTIONS } from '@/lib/workOrderUtils';

const PERU_TZ = 'America/Lima';

function toDateOnly(value: string | undefined | null): string {
    if (value == null || value === '') return '';
    const part = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(part) ? part : value;
}

function toTimeOnly(value: string | undefined | null): string {
    if (value == null || value === '') return '';
    const part = value.slice(0, 5);
    return /^\d{1,2}:\d{2}$/.test(part) ? part : value;
}

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


type ClientOption = {
    value: string;
    label: string;
    document_number?: string | null;
    first_name?: string;
    last_name?: string;
};

type VehicleOption = {
    value: string;
    label: string;
    client_id: number;
    vehicle_model_id: number | null;
};

type WorkOrderFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workOrder?: WorkOrder | null;
    workOrdersIndexPath: string;
    initialClient?: { id: number; first_name: string; last_name: string; document_number?: string | null } | null;
    initialVehicle?: { id: number; plate: string; vehicle_model_id: number | null; client_id: number; vehicle_model?: { id: number; name: string } | null } | null;
};

function toClientOption(c: { id: number; first_name: string; last_name: string; document_number?: string | null } | null | undefined): ClientOption | null {
    if (!c) return null;
    return {
        value: String(c.id),
        label: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || `Cliente #${c.id}`,
        document_number: c.document_number,
        first_name: c.first_name,
        last_name: c.last_name,
    };
}

function toVehicleOption(v: { id: number; plate: string; vehicle_model_id: number | null; client_id: number; vehicle_model?: { id: number; name: string } | null } | null | undefined): VehicleOption | null {
    if (!v) return null;
    return {
        value: String(v.id),
        label: v.vehicle_model ? `${v.plate} — ${v.vehicle_model.name}` : v.plate,
        client_id: v.client_id,
        vehicle_model_id: v.vehicle_model_id,
    };
}

const SEARCH_CLIENTS_URL = '/dashboard/services/work-orders/search-clients';
const SEARCH_VEHICLES_URL = '/dashboard/services/work-orders/search-vehicles';

const reactSelectSharedClassNames = {
    control: () => '!min-h-9 !max-h-9 !rounded-md !border-content-border !border !bg-transparent !shadow-xs !text-xs sm:!text-sm',
    valueContainer: () => '!py-0',
    singleValue: () => '!leading-9 !m-0 !text-xs sm:!text-sm',
    placeholder: () => '!text-muted-foreground !text-xs sm:!text-sm',
    menuPortal: () => 'z-[10050] pointer-events-auto',
    menu: () => '!rounded-md !border !border-content-border !bg-popover !text-popover-foreground !shadow-lg',
    option: () => '!text-xs sm:!text-sm',
    input: () => '!text-xs sm:!text-sm',
};

const reactSelectSharedStyles = {
    control: (base: object) => ({ ...base, minHeight: 36, maxHeight: 36 }),
    input: (base: object) => ({ ...base, margin: 0, padding: 0 }),
    menuPortal: (base: object) => ({ ...base, zIndex: 9999, pointerEvents: 'auto' }),
};

export function WorkOrderFormModal({
    open,
    onOpenChange,
    workOrder,
    workOrdersIndexPath,
    initialClient,
    initialVehicle,
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
        status: workOrder?.status ?? 'ingreso',
        advance_payment_amount: workOrder?.advance_payment_amount != null ? String(workOrder.advance_payment_amount) : '0',
        total_amount: workOrder?.total_amount != null ? String(workOrder.total_amount) : '0',
        notes: workOrder?.notes ?? '',
    });
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [selectedClient, setSelectedClient] = useState<ClientOption | null>(() =>
        isEdit ? toClientOption(initialClient) : null
    );
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(() =>
        isEdit ? toVehicleOption(initialVehicle) : null
    );
    const [processing, setProcessing] = useState(false);

    const canSubmit =
        Number(data.client_id) > 0 &&
        Number(data.vehicle_id) > 0 &&
        data.entry_date.trim() !== '' &&
        data.entry_time.trim() !== '' &&
        data.status.trim() !== '';

    useEffect(() => {
        if (!open) return;
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
            status: workOrder?.status ?? 'ingreso',
            advance_payment_amount: workOrder?.advance_payment_amount != null ? String(workOrder.advance_payment_amount) : '0',
            total_amount: workOrder?.total_amount != null ? String(workOrder.total_amount) : '0',
            notes: workOrder?.notes ?? '',
        });
        setSelectedClient(isEdit ? toClientOption(initialClient) : null);
        setSelectedVehicle(isEdit ? toVehicleOption(initialVehicle) : null);
        setFetchError(null);
        // La dependencia es open + el id de la OT, para re-inicializar solo cuando cambia el registro.
        // Los campos individuales del workOrder se incluyen para no perder datos ante actualizaciones externas.
    }, [
        open,
        workOrder?.id,
        workOrder?.vehicle_id,
        workOrder?.client_id,
        workOrder?.entry_date,
        workOrder?.entry_time,
        workOrder?.entry_mileage,
        workOrder?.exit_mileage,
        workOrder?.client_observation,
        workOrder?.status,
        workOrder?.advance_payment_amount,
        workOrder?.total_amount,
        workOrder?.notes,
        isEdit,
        initialClient,
        initialVehicle,
    ]);

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

    const loadClients = async (inputValue: string): Promise<ClientOption[]> => {
        try {
            const params = new URLSearchParams({ q: inputValue });
            const res = await fetch(`${SEARCH_CLIENTS_URL}?${params.toString()}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error(`Error ${res.status} al buscar clientes.`);
            const json: Array<{ id: number; first_name: string; last_name: string; document_number?: string | null }> = await res.json();
            setFetchError(null);
            return json.map((c) => ({
                value: String(c.id),
                label: `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || `Cliente #${c.id}`,
                document_number: c.document_number,
                first_name: c.first_name,
                last_name: c.last_name,
            }));
        } catch {
            setFetchError('No se pudo cargar la lista de clientes. Intenta de nuevo.');
            return [];
        }
    };

    const loadVehicles = async (inputValue: string): Promise<VehicleOption[]> => {
        try {
            const params = new URLSearchParams({ q: inputValue });
            if (data.client_id) params.set('client_id', String(data.client_id));
            const res = await fetch(`${SEARCH_VEHICLES_URL}?${params.toString()}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error(`Error ${res.status} al buscar vehículos.`);
            const result: Array<{ id: number; plate: string; vehicle_model_id: number | null; client_id: number; vehicle_model?: { id: number; name: string } | null }> = await res.json();
            setFetchError(null);
            return result.map((v) => ({
                value: String(v.id),
                label: v.vehicle_model ? `${v.plate} — ${v.vehicle_model.name}` : v.plate,
                client_id: v.client_id,
                vehicle_model_id: v.vehicle_model_id,
            }));
        } catch {
            setFetchError('No se pudo cargar la lista de vehículos. Intenta de nuevo.');
            return [];
        }
    };

    const handleClientChange = (opt: ClientOption | null) => {
        setSelectedClient(opt);
        setSelectedVehicle(null);
        setData((prev) => ({ ...prev, client_id: opt ? Number(opt.value) : 0, vehicle_id: 0 }));
    };

    const handleVehicleChange = (opt: VehicleOption | null) => {
        setSelectedVehicle(opt);
        setData((prev) => ({ ...prev, vehicle_id: opt ? Number(opt.value) : 0 }));
    };

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
                {fetchError && (
                    <p role="alert" className="text-sm text-destructive px-1">{fetchError}</p>
                )}
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="wo-client_id" className="text-foreground">
                            Cliente <span className="text-destructive">*</span>
                        </Label>
                        <AsyncSelect<ClientOption>
                            inputId="wo-client_id"
                            value={selectedClient}
                            onChange={handleClientChange}
                            loadOptions={loadClients}
                            defaultOptions
                            cacheOptions
                            placeholder="Buscar por nombre o documento…"
                            noOptionsMessage={({ inputValue }) =>
                                inputValue ? 'Sin resultados' : 'Escriba para buscar…'
                            }
                            loadingMessage={() => 'Buscando…'}
                            isClearable
                            formatOptionLabel={(opt, meta) => {
                                const doc = opt.document_number ? opt.document_number : '';
                                const oneLine = doc ? `${opt.label} - ${doc}` : opt.label;
                                if (meta?.context === 'value') return oneLine;
                                return (
                                    <div className="pointer-events-none flex flex-col gap-0.5">
                                        <span>{opt.label}</span>
                                        {doc ? <span className="text-muted-foreground text-xs">Doc: {doc}</span> : null}
                                    </div>
                                );
                            }}
                            classNames={reactSelectSharedClassNames}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                            menuPosition="fixed"
                            styles={reactSelectSharedStyles}
                        />
                        {pageErrors.client_id && (
                            <p className="text-sm text-destructive">{pageErrors.client_id}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-vehicle_id" className="text-foreground">
                            Vehículo <span className="text-destructive">*</span>
                        </Label>
                        <AsyncSelect<VehicleOption>
                            key={`vehicle-select-${data.client_id}`}
                            inputId="wo-vehicle_id"
                            value={selectedVehicle}
                            onChange={handleVehicleChange}
                            loadOptions={loadVehicles}
                            defaultOptions={Boolean(data.client_id)}
                            isDisabled={!data.client_id}
                            placeholder={data.client_id ? 'Seleccione vehículo…' : 'Primero seleccione un cliente'}
                            noOptionsMessage={({ inputValue }) =>
                                inputValue ? 'Sin resultados' : (data.client_id ? 'Sin vehículos para este cliente' : 'Seleccione un cliente primero')
                            }
                            loadingMessage={() => 'Buscando…'}
                            isClearable
                            classNames={reactSelectSharedClassNames}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                            menuPosition="fixed"
                            styles={reactSelectSharedStyles}
                        />
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
                                    {WORK_ORDER_STATUS_OPTIONS.map((opt) => (
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
                        <Label htmlFor="wo-client_observation" className="text-foreground">
                            Observación del cliente
                        </Label>
                        <Textarea
                            id="wo-client_observation"
                            value={data.client_observation ?? ''}
                            onChange={(e) => setData((prev) => ({ ...prev, client_observation: e.target.value }))}
                            placeholder="Qué reporta el cliente"
                            rows={3}
                            className="border-content-border"
                        />
                        {pageErrors.client_observation && (
                            <p className="text-sm text-destructive">{pageErrors.client_observation}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wo-notes" className="text-foreground">
                            Notas internas
                        </Label>
                        <Textarea
                            id="wo-notes"
                            value={data.notes ?? ''}
                            onChange={(e) => setData((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Notas del taller"
                            rows={3}
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
