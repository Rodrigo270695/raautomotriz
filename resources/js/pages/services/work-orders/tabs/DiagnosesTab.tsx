import React, { useState } from 'react';
import { Pencil, Stethoscope, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiagnosisFormModal } from '../components/DiagnosisFormModal';
import { DiagnosisDeleteDialog } from '../components/DiagnosisDeleteDialog';
import type { WorkOrderDiagnosisItem, WorkOrderShowCan } from '../types';
import { formatDiagnosisDateTime } from '../utils';

type DiagnosesTabProps = {
    diagnoses: WorkOrderDiagnosisItem[];
    diagnosesBasePath: string;
    can: WorkOrderShowCan;
};

export function DiagnosesTab({ diagnoses, diagnosesBasePath, can }: DiagnosesTabProps) {
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [formModalDiagnosis, setFormModalDiagnosis] = useState<WorkOrderDiagnosisItem | null>(null);
    const [diagnosisToDelete, setDiagnosisToDelete] = useState<WorkOrderDiagnosisItem | null>(null);

    const openCreateModal = () => {
        setFormModalDiagnosis(null);
        setFormModalOpen(true);
    };
    const openEditModal = (d: WorkOrderDiagnosisItem) => {
        setFormModalDiagnosis(d);
        setFormModalOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                <div className="border-b border-content-border p-3 sm:p-4 flex items-center justify-between gap-2">
                    <h2 className="text-sm font-medium text-foreground">Historial de diagnósticos</h2>
                    {can.diagnoses_create && diagnosesBasePath && (
                        <Button
                            type="button"
                            size="sm"
                            onClick={openCreateModal}
                            className="cursor-pointer bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                        >
                            <Stethoscope className="size-4 mr-1" />
                            <span className="hidden sm:inline">Nuevo diagnóstico</span>
                            <span className="sm:hidden">Agregar</span>
                        </Button>
                    )}
                </div>
                <div className="divide-y divide-content-border">
                    {diagnoses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
                            <Stethoscope className="size-10 text-muted-foreground/60" aria-hidden />
                            <span className="text-muted-foreground text-sm">Aún no hay diagnósticos registrados.</span>
                        </div>
                    ) : (
                        diagnoses.map((d) => (
                            <div key={d.id} className="p-3 sm:p-4">
                                <p className="text-foreground text-sm whitespace-pre-wrap">{d.diagnosis_text}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    {d.diagnosed_at && <span>{formatDiagnosisDateTime(d.diagnosed_at)}</span>}
                                    {d.diagnosed_by_name && <span>{d.diagnosed_by_name}</span>}
                                </div>
                                {d.internal_notes && (
                                    <p className="mt-2 text-muted-foreground text-xs whitespace-pre-wrap border-t border-content-border/60 pt-2">Notas: {d.internal_notes}</p>
                                )}
                                {((can.diagnoses_update && d.can_edit) || (can.diagnoses_delete && d.can_delete)) && (
                                    <div className="mt-3 flex gap-2">
                                        {can.diagnoses_update && d.can_edit && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="cursor-pointer size-9 shrink-0 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                onClick={() => openEditModal(d)}
                                                aria-label="Editar"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                        )}
                                        {can.diagnoses_delete && d.can_delete && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="cursor-pointer size-9 shrink-0 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50"
                                                onClick={() => setDiagnosisToDelete(d)}
                                                aria-label="Eliminar"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <DiagnosisFormModal
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                diagnosis={formModalDiagnosis}
                diagnosesBasePath={diagnosesBasePath}
            />

            <DiagnosisDeleteDialog
                open={!!diagnosisToDelete}
                onOpenChange={(open) => !open && setDiagnosisToDelete(null)}
                diagnosis={diagnosisToDelete}
                diagnosesBasePath={diagnosesBasePath}
            />
        </div>
    );
}
