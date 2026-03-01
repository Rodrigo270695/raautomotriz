import { useForm } from '@inertiajs/react';
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
import ReactSelect from 'react-select';
import type { Vehicle } from '@/types';

const RequiredAsterisk = () => <span className="text-destructive" aria-hidden>*</span>;

type BrandOption = { id: number; name: string };
type VehicleModelOption = { id: number; name: string; brand_id: number; brand_name: string };
type ClientOption = { id: number; name: string; first_name?: string; last_name?: string; document_number?: string };

type VehicleFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehicle?: Vehicle | null;
    vehiclesIndexPath: string;
    brandsForSelect: BrandOption[];
    vehicleModelsForSelect: VehicleModelOption[];
    clientsForSelect: ClientOption[];
    /** Cuando se abre desde Clientes para agregar vehículo a este cliente: oculta el select Cliente y redirige a vehículos filtrado tras crear. */
    preselectedClientId?: number | null;
    /** Id del cliente para redirigir a vista vehículos filtrada tras crear (debe ir junto con preselectedClientId). */
    redirectFilterClientId?: number | null;
};

export function VehicleFormModal({
    open,
    onOpenChange,
    vehicle,
    vehiclesIndexPath,
    brandsForSelect,
    vehicleModelsForSelect,
    clientsForSelect,
    preselectedClientId = null,
    redirectFilterClientId = null,
}: VehicleFormModalProps) {
    const isEdit = Boolean(vehicle?.id);
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const hideClientField = preselectedClientId != null;
    const preselectedClientName = hideClientField
        ? (clientsForSelect.find((c) => c.id === preselectedClientId)?.name ?? '')
        : '';

    const modelsByBrand = useMemo(() => {
        if (!selectedBrandId) return [];
        const brandId = Number(selectedBrandId);
        return vehicleModelsForSelect.filter((m) => m.brand_id === brandId);
    }, [selectedBrandId, vehicleModelsForSelect]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        plate: vehicle?.plate ?? '',
        year: vehicle?.year != null ? String(vehicle.year) : '',
        color: (vehicle?.color as string) ?? '',
        entry_mileage: vehicle?.entry_mileage != null ? String(vehicle.entry_mileage) : '',
        exit_mileage: vehicle?.exit_mileage != null ? String(vehicle.exit_mileage) : '',
        vehicle_model_id: vehicle?.vehicle_model_id != null ? String(vehicle.vehicle_model_id) : '',
        client_id: preselectedClientId != null ? String(preselectedClientId) : (vehicle?.client_id != null ? String(vehicle.client_id) : ''),
        status: (vehicle?.status as string) ?? 'active',
        redirect_to_vehicles_filter_client_id: '',
    });

    const canSubmit =
        data.plate.trim() !== '' &&
        data.client_id.trim() !== '' &&
        data.vehicle_model_id.trim() !== '';

    useEffect(() => {
        if (open) {
            const brandIdFromVehicle = vehicle?.vehicle_model?.brand?.id != null
                ? String(vehicle.vehicle_model.brand.id)
                : '';
            setSelectedBrandId(brandIdFromVehicle);
            const clientId = preselectedClientId != null ? String(preselectedClientId) : (vehicle?.client_id != null ? String(vehicle.client_id) : '');
            setData({
                plate: (vehicle?.plate ?? '').toUpperCase(),
                year: vehicle?.year != null ? String(vehicle.year) : '',
                color: (vehicle?.color as string) ?? '',
                entry_mileage: vehicle?.entry_mileage != null ? String(vehicle.entry_mileage) : '',
                exit_mileage: vehicle?.exit_mileage != null ? String(vehicle.exit_mileage) : '',
                vehicle_model_id: vehicle?.vehicle_model_id != null ? String(vehicle.vehicle_model_id) : '',
                client_id: clientId,
                status: (vehicle?.status as string) ?? 'active',
                redirect_to_vehicles_filter_client_id: redirectFilterClientId != null ? String(redirectFilterClientId) : '',
            });
        }
    }, [open, vehicle?.id, vehicle?.plate, vehicle?.year, vehicle?.color, vehicle?.entry_mileage, vehicle?.exit_mileage, vehicle?.vehicle_model_id, vehicle?.client_id, vehicle?.status, vehicle?.vehicle_model?.brand?.id, preselectedClientId, redirectFilterClientId]);

    // Radix Dialog bloquea pointer-events fuera del contenido; los menús (ReactSelect y Radix Select) están en body.
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

    type ClientSelectOption = {
        value: string;
        label: string;
        document_number?: string;
        first_name?: string;
        last_name?: string;
    };
    const getClientSearchText = (opt: ClientSelectOption) =>
        [
            opt.label,
            opt.first_name,
            opt.last_name,
            opt.document_number,
        ]
            .filter(Boolean)
            .join(' ')
            .trim()
            .toLowerCase();
    const clientSelectOptions = useMemo<ClientSelectOption[]>(
        () =>
            clientsForSelect.map((c) => ({
                value: String(c.id),
                label: c.name,
                document_number: c.document_number,
                first_name: c.first_name,
                last_name: c.last_name,
            })),
        [clientsForSelect]
    );
    const clientSelectValue = useMemo(
        () => clientSelectOptions.find((o) => o.value === data.client_id) ?? null,
        [clientSelectOptions, data.client_id]
    );

    const onBrandChange = (value: string) => {
        setSelectedBrandId(value);
        const currentModelId = data.vehicle_model_id;
        if (currentModelId) {
            const currentModel = vehicleModelsForSelect.find((m) => String(m.id) === currentModelId);
            if (!currentModel || currentModel.brand_id !== Number(value)) {
                setData('vehicle_model_id', '');
            }
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && vehicle) {
            put(`${vehiclesIndexPath}/${vehicle.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(vehiclesIndexPath, {
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
            <DialogContent
                className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:max-w-lg"
                onPointerDownOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[role="listbox"]') ?? target.closest('[class*="Menu"]')) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {isEdit ? 'Editar vehículo' : 'Nuevo vehículo'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit ? 'Modifique los datos del vehículo.' : 'Indique los datos del vehículo.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="vehicle-plate" className="text-foreground">
                                Placa <RequiredAsterisk />
                            </Label>
                            <Input
                                id="vehicle-plate"
                                value={data.plate}
                                onChange={(e) => setData('plate', e.target.value.toUpperCase())}
                                placeholder="ej. ABC-123"
                                className="border-content-border"
                                autoFocus
                                autoComplete="off"
                            />
                            {errors.plate && <p className="text-sm text-destructive">{errors.plate}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vehicle-year" className="text-foreground">
                                Año
                            </Label>
                            <Input
                                id="vehicle-year"
                                type="number"
                                min={1900}
                                max={new Date().getFullYear()}
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                placeholder={`ej. ${new Date().getFullYear()}`}
                                className="border-content-border"
                            />
                            {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="vehicle-color" className="text-foreground">
                            Color
                        </Label>
                        <Input
                            id="vehicle-color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                            placeholder="Opcional"
                            className="border-content-border"
                        />
                        {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="vehicle-entry_mileage" className="text-foreground">
                                Km entrada
                            </Label>
                            <Input
                                id="vehicle-entry_mileage"
                                type="number"
                                min={0}
                                value={data.entry_mileage}
                                onChange={(e) => setData('entry_mileage', e.target.value)}
                                placeholder="Opcional"
                                className="border-content-border"
                            />
                            {errors.entry_mileage && <p className="text-sm text-destructive">{errors.entry_mileage}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vehicle-exit_mileage" className="text-foreground">
                                Km salida
                            </Label>
                            <Input
                                id="vehicle-exit_mileage"
                                type="number"
                                min={0}
                                value={data.exit_mileage}
                                onChange={(e) => setData('exit_mileage', e.target.value)}
                                placeholder="Opcional"
                                className="border-content-border"
                            />
                            {errors.exit_mileage && <p className="text-sm text-destructive">{errors.exit_mileage}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="vehicle-brand" className="text-foreground">
                                Marca <RequiredAsterisk />
                            </Label>
                            <Select
                                value={selectedBrandId}
                                onValueChange={onBrandChange}
                            >
                                <SelectTrigger id="vehicle-brand" className="border-content-border">
                                    <SelectValue placeholder="Seleccione marca" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brandsForSelect.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vehicle-model" className="text-foreground">
                                Modelo <RequiredAsterisk />
                            </Label>
                            <Select
                                value={data.vehicle_model_id}
                                onValueChange={(v) => setData('vehicle_model_id', v)}
                                disabled={!selectedBrandId}
                            >
                                <SelectTrigger id="vehicle-model" className="border-content-border">
                                    <SelectValue placeholder={selectedBrandId ? 'Seleccione modelo' : 'Primero elija marca'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {modelsByBrand.map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.vehicle_model_id && <p className="text-sm text-destructive">{errors.vehicle_model_id}</p>}
                        </div>
                    </div>
                    {hideClientField ? (
                        <div className="space-y-2">
                            <Label className="text-foreground">Cliente</Label>
                            <p className="rounded-md border border-content-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                                {preselectedClientName || '—'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="vehicle-client" className="text-foreground">
                                Cliente <RequiredAsterisk />
                            </Label>
                            <ReactSelect<{ value: string; label: string; document_number?: string }>
                                inputId="vehicle-client"
                                value={clientSelectValue}
                                onChange={(opt) => setData('client_id', opt?.value ?? '')}
                                options={clientSelectOptions}
                                placeholder="Seleccione cliente"
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
                            {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
                        </div>
                    )}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="vehicle-status"
                                checked={data.status === 'active'}
                                onCheckedChange={(checked) =>
                                    setData('status', checked === true ? 'active' : 'inactive')
                                }
                                className="border-content-border"
                            />
                            <Label htmlFor="vehicle-status" className="text-foreground cursor-pointer font-normal">
                                Activo
                            </Label>
                        </div>
                        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                    </div>
                    <DialogFooter className="flex flex-wrap gap-2 sm:justify-end sm:gap-2 pt-2">
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
