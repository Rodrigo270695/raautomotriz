import React, { useState } from 'react';
import { Banknote, Plus, Printer, Send } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ActionButtons } from '@/components/actions';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { WorkOrderPaymentItem, WorkOrderShowCan } from '../types';
import { WorkOrderPaymentFormModal } from './WorkOrderPaymentFormModal';
import { WorkOrderPaymentDeleteDialog } from './WorkOrderPaymentDeleteDialog';

const TYPE_LABELS: Record<string, string> = {
    advance: 'Adelanto',
    partial: 'Abono parcial',
    final: 'Pago final',
};

const METHOD_LABELS: Record<string, string> = {
    yape: 'Yape',
    plim: 'Plim',
    tarjeta: 'Tarjeta',
    efectivo: 'Efectivo',
    otros: 'Otros',
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

type WorkOrderPaymentsSectionProps = {
    payments: WorkOrderPaymentItem[];
    paymentsTotalPaid: number;
    servicesTotal: number;
    paymentsBasePath: string;
    can: WorkOrderShowCan;
    onOpenPrintModal?: (url: string) => void;
};

export function WorkOrderPaymentsSection({
    payments,
    paymentsTotalPaid,
    servicesTotal,
    paymentsBasePath,
    can,
    onOpenPrintModal,
}: WorkOrderPaymentsSectionProps) {
    const getPaymentPrintUrl = (paymentId: number) =>
        (typeof window !== 'undefined' ? window.location.origin : '') + `${paymentsBasePath}/${paymentId}/print`;
    const getPaymentResendUrl = (paymentId: number) =>
        `${paymentsBasePath}/${paymentId}/resend-notification`;
    const [formOpen, setFormOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<WorkOrderPaymentItem | null>(null);
    const [resendingId, setResendingId] = useState<number | null>(null);

    const handleResend = (paymentId: number) => {
        if (resendingId !== null) return;
        setResendingId(paymentId);
        router.post(getPaymentResendUrl(paymentId), {}, {
            preserveScroll: true,
            onFinish: () => setResendingId(null),
        });
    };

    const canView = can.payments_view ?? true;
    const canModify = (can.payments_create ?? false) || (can.payments_delete ?? false);
    const canPrintTicket = can.payments_print_ticket ?? false;
    const canResendNotification = can.payments_resend_notification ?? false;
    const balancePending = Math.max(0, servicesTotal - paymentsTotalPaid);
    const hasServicesWithTotal = servicesTotal > 0;
    const isFullyPaid = hasServicesWithTotal && paymentsTotalPaid >= servicesTotal - 0.01;
    const canAddPayment = can.payments_create && hasServicesWithTotal && !isFullyPaid;
    const hasAdvancePayment = payments.some((p) => p.type === 'advance');
    const addPaymentDisabledReason = !hasServicesWithTotal
        ? 'Guarde primero los servicios y productos de la orden.'
        : isFullyPaid
          ? 'La orden ya está pagada en su totalidad.'
          : null;

    if (!canView && payments.length === 0) return null;

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                <div className="border-b border-content-border p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-sm font-medium text-foreground">Pagos de la orden</h2>
                        {can.payments_create && paymentsBasePath && (
                            addPaymentDisabledReason ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-block">
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled
                                                className="shrink-0 bg-rose-500/50 text-white cursor-not-allowed px-2.5"
                                            >
                                                <Plus className="size-3.5 mr-1" />
                                                <span className="text-xs sm:text-sm">Nuevo pago</span>
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>{addPaymentDisabledReason}</TooltipContent>
                                </Tooltip>
                            ) : (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setFormOpen(true)}
                                    className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700 px-2.5"
                                >
                                    <Plus className="size-3.5 mr-1" />
                                    <span className="text-xs sm:text-sm">Nuevo pago</span>
                                </Button>
                            )
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-b border-content-border px-3 py-2 sm:px-4 sm:py-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Banknote className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Total pagado</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                            S/ {formatCurrency(paymentsTotalPaid)}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <span className="text-muted-foreground">Saldo pendiente</span>
                        <span className="font-semibold text-amber-700 dark:text-amber-300">
                            S/ {formatCurrency(balancePending)}
                        </span>
                    </span>
                </div>
                {payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
                        <Banknote className="size-10 text-muted-foreground/60" aria-hidden />
                        <span className="text-muted-foreground text-sm text-center max-w-md">
                            No hay pagos registrados en esta orden.
                        </span>
                        {can.payments_create && paymentsBasePath && (
                            addPaymentDisabledReason ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-block">
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled
                                                className="bg-rose-500/50 text-white cursor-not-allowed"
                                            >
                                                <Plus className="size-3.5 mr-1" />
                                                Nuevo pago
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>{addPaymentDisabledReason}</TooltipContent>
                                </Tooltip>
                            ) : (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setFormOpen(true)}
                                    className="cursor-pointer bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                                >
                                    <Plus className="size-3.5 mr-1" />
                                    Nuevo pago
                                </Button>
                            )
                        )}
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-content-border bg-content-muted/30">
                                        <th className="text-left font-medium text-foreground py-3 px-3 whitespace-nowrap w-28">
                                            Tipo
                                        </th>
                                        <th className="text-right font-medium text-foreground py-3 px-3 whitespace-nowrap min-w-[80px]">
                                            Monto
                                        </th>
                                        <th className="text-left font-medium text-foreground py-3 px-3 min-w-[100px]">
                                            Método
                                        </th>
                                        <th className="text-left font-medium text-foreground py-3 px-3 whitespace-nowrap min-w-[120px]">
                                            Fecha
                                        </th>
                                        <th className="text-left font-medium text-foreground py-3 px-3 min-w-[80px]">
                                            Referencia
                                        </th>
                                        <th className="text-left font-medium text-foreground py-3 px-3">
                                            Notas
                                        </th>
                                        {(canModify || (onOpenPrintModal && canPrintTicket)) && (
                                            <th className="w-[140px] text-right font-medium text-foreground py-3 px-3 whitespace-nowrap">
                                                Acciones
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b border-content-border/60 hover:bg-content-muted/10"
                                        >
                                            <td className="py-2.5 px-3 align-middle">
                                                <span className="inline-flex rounded-full bg-content-muted/60 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                                                    {TYPE_LABELS[p.type] ?? p.type}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-right align-middle tabular-nums font-medium">
                                                S/ {formatCurrency(p.amount)}
                                            </td>
                                            <td className="py-2.5 px-3 align-middle text-muted-foreground text-sm truncate max-w-[120px]" title={p.payment_method ?? undefined}>
                                                {METHOD_LABELS[p.payment_method ?? ''] ?? p.payment_method ?? '—'}
                                            </td>
                                            <td className="py-2.5 px-3 align-middle text-muted-foreground text-sm whitespace-nowrap">
                                                {formatDate(p.paid_at)}
                                            </td>
                                            <td className="py-2.5 px-3 align-middle text-muted-foreground text-sm truncate max-w-[100px]" title={p.reference ?? undefined}>
                                                {p.reference || '—'}
                                            </td>
                                            <td className="py-2.5 px-3 align-middle text-muted-foreground text-sm truncate max-w-[140px]" title={p.notes ?? undefined}>
                                                {p.notes || '—'}
                                            </td>
{(canModify || (onOpenPrintModal && canPrintTicket) || canResendNotification) && (
                                            <td className="py-2.5 px-3 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {onOpenPrintModal && canPrintTicket && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="cursor-pointer size-8 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                                                                onClick={() => onOpenPrintModal(getPaymentPrintUrl(p.id))}
                                                                title="Imprimir comprobante"
                                                            >
                                                                <Printer className="size-4" />
                                                            </Button>
                                                        )}
                                                        {canResendNotification && paymentsBasePath && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="cursor-pointer size-8 text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/40"
                                                                onClick={() => handleResend(p.id)}
                                                                disabled={resendingId === p.id}
                                                                title="Reenviar comprobante al cliente"
                                                            >
                                                                <Send className="size-4" />
                                                            </Button>
                                                        )}
                                                        {canModify && paymentsBasePath && (
                                                            <ActionButtons
                                                                editLabel="Editar pago"
                                                                deleteLabel="Eliminar pago"
                                                                canEdit={false}
                                                                canDelete={can.payments_delete ?? false}
                                                                onDelete={() => setPaymentToDelete(p)}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-content-border bg-content-muted/20">
                                        <td className="py-2.5 px-3 text-right text-sm font-medium text-muted-foreground" colSpan={5}>
                                            Total pagado
                                        </td>
                                        <td className="py-2.5 px-3 text-right text-sm font-semibold text-foreground tabular-nums">
                                            S/ {formatCurrency(paymentsTotalPaid)}
                                        </td>
                                        {(canModify || (onOpenPrintModal && canPrintTicket) || canResendNotification) && <td />}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="block md:hidden">
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {payments.map((p) => (
                                    <li key={p.id}>
                                        <DataTableCard
                                            title={
                                                <span className="text-foreground">
                                                    {TYPE_LABELS[p.type] ?? p.type}
                                                    <span className="ml-1.5 text-muted-foreground text-xs">
                                                        S/ {formatCurrency(p.amount)}
                                                    </span>
                                                </span>
                                            }
                                            actions={
                                                (canModify && paymentsBasePath) || (onOpenPrintModal && canPrintTicket) || canResendNotification ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        {onOpenPrintModal && canPrintTicket && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="cursor-pointer h-8 gap-1.5 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                                                                onClick={() => onOpenPrintModal(getPaymentPrintUrl(p.id))}
                                                                title="Imprimir comprobante"
                                                            >
                                                                <Printer className="size-3.5" />
                                                                <span>Imprimir</span>
                                                            </Button>
                                                        )}
                                                        {canResendNotification && paymentsBasePath && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="cursor-pointer h-8 gap-1.5 text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/40"
                                                                onClick={() => handleResend(p.id)}
                                                                disabled={resendingId === p.id}
                                                                title="Reenviar comprobante al cliente"
                                                            >
                                                                <Send className="size-3.5" />
                                                                <span>Reenviar</span>
                                                            </Button>
                                                        )}
                                                        {canModify && paymentsBasePath && (
                                                            <ActionButtons
                                                                editLabel="Editar pago"
                                                                deleteLabel="Eliminar pago"
                                                                canEdit={false}
                                                                canDelete={can.payments_delete ?? false}
                                                                onDelete={() => setPaymentToDelete(p)}
                                                            />
                                                        )}
                                                    </div>
                                                ) : undefined
                                            }
                                            fields={[
                                                { label: 'Método', value: METHOD_LABELS[p.payment_method ?? ''] ?? p.payment_method ?? '—' },
                                                { label: 'Fecha', value: formatDate(p.paid_at) },
                                                { label: 'Referencia', value: p.reference || '—' },
                                                { label: 'Notas', value: p.notes || '—' },
                                            ]}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-content-border px-4 py-3 flex justify-end">
                                <span className="text-sm font-semibold text-foreground">
                                    Total pagado S/ {formatCurrency(paymentsTotalPaid)}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {canModify && paymentsBasePath && (
                <>
                    <WorkOrderPaymentFormModal
                        open={formOpen}
                        onOpenChange={setFormOpen}
                        payment={null}
                        paymentsBasePath={paymentsBasePath}
                        hasAdvancePayment={hasAdvancePayment}
                        pendingAmount={balancePending}
                    />
                    <WorkOrderPaymentDeleteDialog
                        open={!!paymentToDelete}
                        onOpenChange={(open) => !open && setPaymentToDelete(null)}
                        payment={paymentToDelete}
                        paymentsBasePath={paymentsBasePath}
                    />
                </>
            )}
        </>
    );
}
