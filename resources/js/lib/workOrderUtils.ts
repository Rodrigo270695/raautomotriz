import type { WorkOrderStatus } from '@/types/models/WorkOrder';

export const WORK_ORDER_STATUS_OPTIONS: Array<{ value: WorkOrderStatus; label: string }> = [
    { value: 'ingreso', label: 'Ingreso' },
    { value: 'en_checklist', label: 'En checklist' },
    { value: 'diagnosticado', label: 'Diagnosticado' },
    { value: 'en_reparacion', label: 'En reparación' },
    { value: 'listo_para_entregar', label: 'Listo para entregar' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' },
];

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = Object.fromEntries(
    WORK_ORDER_STATUS_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<WorkOrderStatus, string>;

/** Devuelve la etiqueta legible de un estado de OT. */
export function getWorkOrderStatusLabel(status: WorkOrderStatus | string): string {
    return WORK_ORDER_STATUS_LABELS[status as WorkOrderStatus] ?? status.replace(/_/g, ' ');
}

/** Formatea un valor numérico como moneda peruana (PEN). */
export function formatCurrency(value: number | string | null | undefined): string {
    const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
    if (isNaN(num)) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(num);
}
