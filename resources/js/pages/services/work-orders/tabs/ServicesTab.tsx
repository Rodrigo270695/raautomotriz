import React, { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Package, Tag, Plus, Wrench, ShoppingCart, Save, CheckCircle } from 'lucide-react';
import ReactSelect from 'react-select';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ActionButtons } from '@/components/actions';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import type { WorkOrderServiceItem, WorkOrderShowCan, WorkOrderPackageOption } from '../types';
import { WorkOrderServiceFormModal } from '../components/WorkOrderServiceFormModal';
import { WorkOrderServiceDeleteDialog } from '../components/WorkOrderServiceDeleteDialog';
import { WorkOrderProductFormModal } from '../components';
import { WorkOrderPaymentsSection } from '../components/WorkOrderPaymentsSection';

type PackageSelectOption = {
    value: string;
    label: string;
    data: WorkOrderPackageOption;
};

type ServicesTabProps = {
    services: WorkOrderServiceItem[];
    servicesTotal: number;
    servicesBasePath: string;
    applyPackagePath: string;
    packagesForSelect: WorkOrderPackageOption[];
    productsForSelect: Array<{ value: number; label: string; sale_price: number }>;
    payments?: Array<{
        id: number;
        type: string;
        amount: number;
        payment_method: string | null;
        paid_at: string | null;
        reference: string | null;
        notes: string | null;
    }>;
    paymentsTotalPaid?: number;
    paymentsBasePath?: string;
    can: WorkOrderShowCan;
    workOrderStatus?: string;
    lastTicketServiceCount?: number | null;
    canConfirmRepair?: boolean;
    confirmRepairButtonLabel?: string;
    onConfirmRepair?: () => void;
    onOpenPrintModal?: (url: string) => void;
    markReadyPath?: string;
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/** IGV incluido 18%: base = total/1.18, igv = total - base */
function igvBreakdown(totalConIgv: number): { base: number; igv: number } {
    const base = Math.round((totalConIgv / 1.18) * 100) / 100;
    const igv = Math.round((totalConIgv - base) * 100) / 100;
    return { base, igv };
}

export function ServicesTab({
    services,
    servicesTotal,
    servicesBasePath,
    applyPackagePath,
    packagesForSelect,
    productsForSelect,
    payments = [],
    paymentsTotalPaid = 0,
    paymentsBasePath = '',
    can,
    workOrderStatus = '',
    lastTicketServiceCount,
    canConfirmRepair = false,
    confirmRepairButtonLabel = 'Guardar e iniciar reparación',
    onConfirmRepair,
    onOpenPrintModal,
    markReadyPath,
}: ServicesTabProps) {
    const hasServices = services.length > 0;
    const packageOptions = packagesForSelect ?? [];
    const { base: baseImponible, igv } = igvBreakdown(servicesTotal);

    const [formOpen, setFormOpen] = useState(false);
    const [editingService, setEditingService] = useState<WorkOrderServiceItem | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<WorkOrderServiceItem | null>(null);
    const [productFormOpen, setProductFormOpen] = useState(false);
    const [selectedPackageId, setSelectedPackageId] = useState<string>('');
    const [applyingPackage, setApplyingPackage] = useState(false);
    const [markReadyOpen, setMarkReadyOpen] = useState(false);
    const [markingReady, setMarkingReady] = useState(false);

    const canModify = can.update ?? false;

    const showMarkReadyButton =
        canModify &&
        markReadyPath &&
        !['listo_para_entregar', 'entregado', 'cancelado'].includes(workOrderStatus);

    const handleMarkReady = () => {
        if (!markReadyPath) return;
        setMarkingReady(true);
        router.post(markReadyPath, {}, {
            onFinish: () => {
                setMarkingReady(false);
                setMarkReadyOpen(false);
            },
        });
    };
    /** Línea ya guardada (existía cuando se generó el último ticket): solo se puede eliminar (devolver a stock), no editar. */
    const isSavedLine = (index: number) =>
        workOrderStatus === 'en_reparacion' &&
        lastTicketServiceCount != null &&
        index < lastTicketServiceCount;
    const canEditLine = (index: number) => canModify && !isSavedLine(index);
    const canDeleteLine = () => canModify;

    const packageSelectOptions = useMemo<PackageSelectOption[]>(
        () =>
            packageOptions.map((p) => ({
                value: String(p.id),
                label: p.name,
                data: p,
            })),
        [packageOptions]
    );

    const selectedPackageValue = useMemo(
        () => packageSelectOptions.find((o) => o.value === selectedPackageId) ?? null,
        [packageSelectOptions, selectedPackageId]
    );

    const getPackageSearchText = (opt: PackageSelectOption) =>
        [opt.label, opt.data.service_type_name, opt.data.name]
            .filter(Boolean)
            .join(' ')
            .trim()
            .toLowerCase();

    const handlePackageChange = (opt: PackageSelectOption | null) => {
        setSelectedPackageId(opt?.value ?? '');
    };

    const openCreate = () => {
        if (!canModify || !servicesBasePath) return;
        setEditingService(null);
        setFormOpen(true);
    };

    const openEdit = (service: WorkOrderServiceItem) => {
        if (!canModify || !servicesBasePath) return;
        setEditingService(service);
        setFormOpen(true);
    };

    const handleApplyPackage = () => {
        if (!canModify || !applyPackagePath || !selectedPackageId) return;
        setApplyingPackage(true);
        router.post(
            applyPackagePath,
            { service_package_id: Number(selectedPackageId) },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedPackageId(''),
                onFinish: () => setApplyingPackage(false),
            },
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                    <Package className="size-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-muted-foreground">Líneas</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{services.length}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                    <Tag className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-muted-foreground">Total servicios</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        S/ {formatCurrency(servicesTotal)}
                    </span>
                </span>
                {canConfirmRepair && onConfirmRepair && (
                    <Button
                        type="button"
                        size="sm"
                        className="ml-auto shrink-0 cursor-pointer"
                        onClick={onConfirmRepair}
                    >
                        <Save className="mr-1.5 size-4" />
                        {confirmRepairButtonLabel}
                    </Button>
                )}
            </div>

            {canModify && (packageOptions.length > 0 || servicesBasePath) && (
                <div className="overflow-hidden rounded-xl border border-content-border bg-card p-4 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
                        {packageOptions.length > 0 && applyPackagePath && (
                            <div className="w-full min-w-0 sm:min-w-[200px] sm:max-w-md sm:flex-1">
                                <label htmlFor="services-package-select" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Paquete de servicio
                                </label>
                                <ReactSelect<PackageSelectOption>
                                    inputId="services-package-select"
                                    value={selectedPackageValue}
                                    onChange={handlePackageChange}
                                    options={packageSelectOptions}
                                    placeholder="Buscar paquete…"
                                    noOptionsMessage={() => 'No hay coincidencias'}
                                    isClearable
                                    filterOption={(option, input) => {
                                        const query = input.trim().toLowerCase();
                                        if (!query) return true;
                                        const searchText = getPackageSearchText('data' in option ? option.data : option);
                                        return query.split(/\s+/).every((word) => searchText.includes(word));
                                    }}
                                    formatOptionLabel={(opt, meta) => {
                                        if (meta?.context === 'value') {
                                            return opt.data.name;
                                        }
                                        return (
                                            <div className="pointer-events-none flex flex-col gap-0.5">
                                                <span className="font-medium">{opt.data.name}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {opt.data.service_type_name ?? '—'}
                                                    {opt.data.total_amount != null
                                                        ? ` · S/ ${formatCurrency(opt.data.total_amount)}`
                                                        : ''}
                                                </span>
                                            </div>
                                        );
                                    }}
                                    classNames={{
                                        control: () =>
                                            '!min-h-9 !max-h-9 !rounded-md !border-content-border !border !bg-transparent !shadow-xs !text-xs sm:!text-sm',
                                        valueContainer: () => '!py-0',
                                        singleValue: () => '!leading-9 !m-0 !text-xs sm:!text-sm',
                                        placeholder: () => '!text-muted-foreground !text-xs sm:!text-sm',
                                        menuPortal: () => 'z-[10050]',
                                        menu: () =>
                                            '!rounded-md !border !border-content-border !bg-popover !text-popover-foreground !shadow-lg',
                                        option: () => '!text-xs',
                                        input: () => '!text-xs',
                                    }}
                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                                    styles={{
                                        control: (base) => ({ ...base, minHeight: 36, maxHeight: 36 }),
                                        input: (base) => ({ ...base, margin: 0, padding: 0 }),
                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                    }}
                                />
                            </div>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:shrink-0">
                            {packageOptions.length > 0 && applyPackagePath && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleApplyPackage}
                                    disabled={!selectedPackageId || applyingPackage}
                                    className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700 px-2.5"
                                >
                                    {applyingPackage ? (
                                        'Aplicando…'
                                    ) : (
                                        <>
                                            <Package className="size-3.5 mr-1" />
                                            <span className="text-xs sm:text-sm">Paquete</span>
                                        </>
                                    )}
                                </Button>
                            )}
                            {servicesBasePath && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={openCreate}
                                    className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700 px-2.5"
                                >
                                    <Wrench className="size-3.5 mr-1" />
                                    <span className="text-xs sm:text-sm">Servicio</span>
                                </Button>
                            )}
                            {servicesBasePath && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setProductFormOpen(true)}
                                    className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700 px-2.5"
                                >
                                    <ShoppingCart className="size-3.5 mr-1" />
                                    <span className="text-xs sm:text-sm">Producto</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                <div className="border-b border-content-border p-3 sm:p-4">
                    <h2 className="text-sm font-medium text-foreground">Servicios y productos de la orden</h2>
                </div>
                {!hasServices ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
                        <Package className="size-10 text-muted-foreground/60" aria-hidden />
                        <span className="text-muted-foreground text-sm text-center max-w-md">
                            Esta orden aún no tiene servicios ni productos registrados.
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-content-border bg-content-muted/30">
                                        <th className="text-left font-medium text-foreground py-3 px-3 whitespace-nowrap w-24">
                                            Tipo
                                        </th>
                                        <th className="text-left font-medium text-foreground py-3 px-3 min-w-[120px]">
                                            Producto / servicio
                                        </th>
                                        <th className="text-left font-medium text-foreground py-3 px-3 whitespace-nowrap min-w-[80px]">
                                            Paquete
                                        </th>
                                        <th className="text-right font-medium text-foreground py-3 px-3 whitespace-nowrap w-16">
                                            Cant.
                                        </th>
                                        <th className="text-right font-medium text-foreground py-3 px-3 whitespace-nowrap min-w-[80px]">
                                            P. unitario
                                        </th>
                                        <th className="text-right font-medium text-foreground py-3 px-3 whitespace-nowrap min-w-[80px]">
                                            Subtotal
                                        </th>
                                        {canModify && <th className="w-[110px] text-right font-medium text-foreground py-3 px-3 whitespace-nowrap">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((s, index) => {
                                        const isProduct = s.type === 'product' || (s.type == null && s.product_id != null);
                                        const typeLabel = isProduct ? 'PRODUCTO' : 'SERVICIO';
                                        const productLabel = s.product_name
                                            ? s.product_brand_name
                                                ? `${s.product_brand_name} – ${s.product_name}`
                                                : s.product_name
                                            : s.description || '—';
                                        const canEdit = canEditLine(index);
                                        const canDelete = canDeleteLine();

                                        return (
                                            <tr
                                                key={s.id}
                                                className="border-b border-content-border/60 hover:bg-content-muted/10"
                                            >
                                                <td className="py-2.5 px-3 align-middle">
                                                    <span className="inline-flex rounded-full bg-content-muted/60 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                                                        {typeLabel}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 align-middle">
                                                    <span className="block text-foreground text-sm truncate max-w-[200px]" title={productLabel}>
                                                        {productLabel}
                                                    </span>
                                                    {s.description && s.product_name && (
                                                        <span className="block text-muted-foreground text-xs truncate max-w-[200px]" title={s.description}>
                                                            {s.description}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 align-middle text-muted-foreground text-sm truncate max-w-[120px]" title={s.service_package_name ?? undefined}>
                                                    {s.service_package_name || '—'}
                                                </td>
                                                <td className="py-2.5 px-3 text-right align-middle tabular-nums text-sm">
                                                    {formatCurrency(s.quantity)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right align-middle tabular-nums text-sm">
                                                    S/ {formatCurrency(s.unit_price)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right align-middle tabular-nums text-sm font-medium">
                                                    S/ {formatCurrency(s.subtotal)}
                                                </td>
                                                {canModify && servicesBasePath && (
                                                    <td className="py-2.5 px-3 align-middle text-right">
                                                        <ActionButtons
                                                            editLabel="Editar servicio"
                                                            deleteLabel="Eliminar servicio"
                                                            canEdit={canEdit}
                                                            canDelete={canDelete}
                                                            onEdit={() => openEdit(s)}
                                                            onDelete={() => setServiceToDelete(s)}
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-content-border bg-content-muted/20">
                                        <td colSpan={5} className="py-1.5 px-3 text-right text-sm text-muted-foreground">
                                            Subtotal (base)
                                        </td>
                                        <td className="py-1.5 px-3 text-right text-sm text-muted-foreground tabular-nums">
                                            S/ {formatCurrency(baseImponible)}
                                        </td>
                                        {canModify && <td />}
                                    </tr>
                                    <tr className="bg-content-muted/20">
                                        <td colSpan={5} className="py-1.5 px-3 text-right text-sm text-muted-foreground">
                                            IGV (18%)
                                        </td>
                                        <td className="py-1.5 px-3 text-right text-sm text-muted-foreground tabular-nums">
                                            S/ {formatCurrency(igv)}
                                        </td>
                                        {canModify && <td />}
                                    </tr>
                                    <tr className="bg-content-muted/20">
                                        <td colSpan={5} className="py-2.5 px-3 text-right text-sm font-medium text-foreground">
                                            Total servicios
                                        </td>
                                        <td className="py-2.5 px-3 text-right text-sm font-semibold text-foreground tabular-nums">
                                            S/ {formatCurrency(servicesTotal)}
                                        </td>
                                        {canModify && <td />}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="block md:hidden">
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {services.map((s, index) => {
                                    const isProduct = s.type === 'product' || (s.type == null && s.product_id != null);
                                    const typeLabel = isProduct ? 'PRODUCTO' : 'SERVICIO';
                                    const productLabel = s.product_name
                                        ? s.product_brand_name
                                            ? `${s.product_brand_name} – ${s.product_name}`
                                            : s.product_name
                                        : s.description || '—';
                                    const canEdit = canEditLine(index);
                                    const canDelete = canDeleteLine();

                                    return (
                                        <li key={s.id}>
                                            <DataTableCard
                                                title={
                                                    <span className="text-foreground">
                                                        {productLabel}
                                                        <span className="ml-1.5 inline-flex rounded-full bg-content-muted/60 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                                                            {typeLabel}
                                                        </span>
                                                    </span>
                                                }
                                                actions={
                                                    canModify && servicesBasePath ? (
                                                        <ActionButtons
                                                            editLabel="Editar servicio"
                                                            deleteLabel="Eliminar servicio"
                                                            canEdit={canEdit}
                                                            canDelete={canDelete}
                                                            onEdit={() => openEdit(s)}
                                                            onDelete={() => setServiceToDelete(s)}
                                                        />
                                                    ) : undefined
                                                }
                                                fields={[
                                                    { label: 'Paquete', value: s.service_package_name || '—' },
                                                    { label: 'Cant.', value: formatCurrency(s.quantity) },
                                                    { label: 'P. unitario', value: `S/ ${formatCurrency(s.unit_price)}` },
                                                    { label: 'Subtotal', value: `S/ ${formatCurrency(s.subtotal)}` },
                                                ]}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="border-t border-content-border px-4 py-3 space-y-1 text-right text-sm">
                                <div className="text-muted-foreground">
                                    Subtotal (base) S/ {formatCurrency(baseImponible)}
                                </div>
                                <div className="text-muted-foreground">
                                    IGV (18%) S/ {formatCurrency(igv)}
                                </div>
                                <div className="font-semibold text-foreground">
                                    Total servicios S/ {formatCurrency(servicesTotal)}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <WorkOrderPaymentsSection
                payments={payments}
                paymentsTotalPaid={paymentsTotalPaid}
                servicesTotal={servicesTotal}
                paymentsBasePath={paymentsBasePath}
                can={can}
                onOpenPrintModal={onOpenPrintModal}
            />

            {showMarkReadyButton && (
                <div className="flex justify-end pt-1">
                    <Button
                        type="button"
                        onClick={() => setMarkReadyOpen(true)}
                        className="cursor-pointer gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                    >
                        <CheckCircle className="size-4" />
                        Listo para entregar
                    </Button>
                </div>
            )}

            <Dialog open={markReadyOpen} onOpenChange={setMarkReadyOpen}>
                <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">¿Marcar como listo para entregar?</DialogTitle>
                        <DialogDescription className="sr-only">Confirmar cambio de estado</DialogDescription>
                    </DialogHeader>
                    <Separator className="bg-content-border" />
                    <p className="text-sm text-muted-foreground">
                        El estado de la orden cambiará a <span className="font-medium text-foreground">Listo para entregar</span>. Podrás continuar editando si es necesario.
                    </p>
                    <DialogFooter className="flex flex-wrap gap-2 sm:justify-end sm:gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMarkReadyOpen(false)}
                            disabled={markingReady}
                            className="cursor-pointer border-content-border min-w-0 flex-1 sm:flex-none"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleMarkReady}
                            disabled={markingReady}
                            className="cursor-pointer min-w-0 flex-1 sm:flex-none bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                        >
                            {markingReady ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Guardando…
                                </span>
                            ) : (
                                <>
                                    <CheckCircle className="size-4" />
                                    Confirmar
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {canModify && servicesBasePath && (
                <>
                    <WorkOrderServiceFormModal
                        open={formOpen}
                        onOpenChange={setFormOpen}
                        service={editingService}
                        servicesBasePath={servicesBasePath}
                    />
                    <WorkOrderServiceDeleteDialog
                        open={!!serviceToDelete}
                        onOpenChange={(open) => !open && setServiceToDelete(null)}
                        service={serviceToDelete}
                        servicesBasePath={servicesBasePath}
                    />
                    <WorkOrderProductFormModal
                        open={productFormOpen}
                        onOpenChange={setProductFormOpen}
                        servicesBasePath={servicesBasePath}
                        productsForSelect={productsForSelect}
                    />
                </>
            )}
        </div>
    );
}

