import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkOrder, WorkOrderShowCan } from '../types';
import { STATUS_LABELS } from '../types';
import { formatEntryDateTime } from '../utils';

type DataTabProps = {
    workOrder: WorkOrder;
    can: WorkOrderShowCan;
    onEdit: () => void;
    onDelete: () => void;
};

export function DataTab({ workOrder, can, onEdit, onDelete }: DataTabProps) {
    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                <div className="border-b border-content-border p-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-medium text-foreground">Datos de la orden</h2>
                    <div className="flex items-center gap-2">
                        {can.update && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                onClick={onEdit}
                            >
                                <Pencil className="size-4 sm:mr-1.5" />
                                Editar
                            </Button>
                        )}
                        {can.delete && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={onDelete}
                            >
                                <Trash2 className="size-4 sm:mr-1.5" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </div>
                <dl className="grid gap-3 p-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground text-xs font-medium">F. ingreso</dt>
                        <dd className="text-foreground text-sm">{formatEntryDateTime(workOrder.entry_date, workOrder.entry_time)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground text-xs font-medium">Estado</dt>
                        <dd>
                            <span className="rounded-full bg-content-muted/60 px-1.5 py-0.5 text-xs font-medium text-foreground">
                                {STATUS_LABELS[workOrder.status] ?? workOrder.status}
                            </span>
                        </dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-muted-foreground text-xs font-medium">Observación del cliente</dt>
                        <dd className="text-foreground text-sm whitespace-pre-wrap">{workOrder.client_observation || '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-muted-foreground text-xs font-medium">Diagnóstico</dt>
                        <dd className="text-foreground text-sm whitespace-pre-wrap">{workOrder.diagnosis || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground text-xs font-medium">Adelanto</dt>
                        <dd className="text-foreground text-sm">{Number(workOrder.advance_payment_amount).toLocaleString('es-PE')}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground text-xs font-medium">Total</dt>
                        <dd className="text-foreground text-sm">{Number(workOrder.total_amount).toLocaleString('es-PE')}</dd>
                    </div>
                    {workOrder.notes && (
                        <div className="sm:col-span-2">
                            <dt className="text-muted-foreground text-xs font-medium">Notas</dt>
                            <dd className="text-foreground text-sm whitespace-pre-wrap">{workOrder.notes}</dd>
                        </div>
                    )}
                </dl>
            </div>
        </div>
    );
}
