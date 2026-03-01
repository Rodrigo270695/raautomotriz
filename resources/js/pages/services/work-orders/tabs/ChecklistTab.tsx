import { router } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { ServiceChecklistItem, ChecklistResultItem, WorkOrderShowCan } from '../types';

type ChecklistTabProps = {
    serviceChecklists: ServiceChecklistItem[];
    checklistResults: ChecklistResultItem[];
    checklistResultsPath?: string;
    can: WorkOrderShowCan;
};

export function ChecklistTab({ serviceChecklists, checklistResults, checklistResultsPath, can }: ChecklistTabProps) {
    const resultsByChecklistId = useMemo(() => {
        const map: Record<number, { checked: boolean; note: string }> = {};
        for (const sc of serviceChecklists) {
            const r = checklistResults.find((x) => x.service_checklist_id === sc.id);
            map[sc.id] = { checked: r?.checked ?? false, note: r?.note ?? '' };
        }
        return map;
    }, [serviceChecklists, checklistResults]);

    const [checklistState, setChecklistState] = useState<Record<number, { checked: boolean; note: string }>>(resultsByChecklistId);
    const [savingChecklist, setSavingChecklist] = useState(false);

    useEffect(() => {
        setChecklistState(resultsByChecklistId);
    }, [resultsByChecklistId]);

    const setChecklistRow = (serviceChecklistId: number, field: 'checked' | 'note', value: boolean | string) => {
        setChecklistState((prev) => {
            const row = prev[serviceChecklistId] ?? { checked: false, note: '' };
            if (field === 'checked') return { ...prev, [serviceChecklistId]: { ...row, checked: value as boolean } };
            return { ...prev, [serviceChecklistId]: { ...row, note: value as string } };
        });
    };

    const handleSubmitChecklist = (e: React.FormEvent) => {
        e.preventDefault();
        if (!checklistResultsPath) return;
        setSavingChecklist(true);
        router.put(checklistResultsPath, {
            results: serviceChecklists.map((sc) => ({
                service_checklist_id: sc.id,
                checked: checklistState[sc.id]?.checked ?? false,
                note: (checklistState[sc.id]?.note ?? '').trim() || null,
            })),
        }, {
            onFinish: () => setSavingChecklist(false),
        });
    };

    const canUpdate = can.checklist_results_update ?? can.update;

    return (
        <form onSubmit={handleSubmitChecklist} className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                <div className="border-b border-content-border p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-medium text-foreground">Lista de chequeo</h2>
                    {canUpdate && checklistResultsPath && (
                        <Button
                            type="submit"
                            disabled={savingChecklist}
                            className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                        >
                            {savingChecklist ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {checklistResults.length === 0 ? 'Guardando…' : 'Actualizando…'}
                                </span>
                            ) : (
                                checklistResults.length === 0 ? 'Guardar' : 'Actualizar'
                            )}
                        </Button>
                    )}
                </div>
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                    {serviceChecklists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-12 px-4">
                            <ClipboardList className="size-10 text-muted-foreground/60" aria-hidden />
                            <span className="text-muted-foreground text-sm">No hay ítems de lista de chequeo activos.</span>
                        </div>
                    ) : (
                        <table className="w-full min-w-0 border-collapse text-xs sm:text-sm table-fixed">
                            <thead>
                                <tr className="border-b border-content-border bg-content-muted/30">
                                    <th className="text-left font-medium text-foreground py-1.5 px-2 sm:py-3 sm:px-3 w-[40%] sm:w-auto sm:min-w-0">Ítem</th>
                                    <th className="text-center font-medium text-foreground py-1.5 px-1 sm:py-3 sm:px-3 w-12 sm:w-24" title="Bueno"><span className="sm:hidden">B.</span><span className="hidden sm:inline">Bueno</span></th>
                                    <th className="text-center font-medium text-foreground py-1.5 px-1 sm:py-3 sm:px-3 w-12 sm:w-24" title="Malo"><span className="sm:hidden">M.</span><span className="hidden sm:inline">Malo</span></th>
                                    <th className="text-left font-medium text-foreground py-1.5 px-2 sm:py-3 sm:px-3 w-[40%] sm:w-auto sm:min-w-[180px]">Nota</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceChecklists.map((sc) => {
                                    const row = checklistState[sc.id] ?? { checked: false, note: '' };
                                    return (
                                        <tr key={sc.id} className="border-b border-content-border/60 hover:bg-content-muted/10">
                                            <td className="py-1.5 px-2 sm:py-2.5 sm:px-3 font-medium text-foreground align-middle break-words">
                                                {sc.name}
                                            </td>
                                            <td className="py-1.5 px-1 sm:py-2.5 sm:px-3 text-center align-middle">
                                                {canUpdate ? (
                                                    <Checkbox
                                                        checked={row.checked === true}
                                                        onCheckedChange={(checked) => setChecklistRow(sc.id, 'checked', checked === true)}
                                                        className="mx-auto size-4 sm:size-4"
                                                        aria-label={`${sc.name} bueno`}
                                                    />
                                                ) : (
                                                    <span className="text-xs sm:text-sm">{row.checked ? '✓' : '—'}</span>
                                                )}
                                            </td>
                                            <td className="py-1.5 px-1 sm:py-2.5 sm:px-3 text-center align-middle">
                                                {canUpdate ? (
                                                    <Checkbox
                                                        checked={row.checked === false}
                                                        onCheckedChange={(checked) => checked && setChecklistRow(sc.id, 'checked', false)}
                                                        className="mx-auto size-4 sm:size-4"
                                                        aria-label={`${sc.name} malo`}
                                                    />
                                                ) : (
                                                    <span className="text-xs sm:text-sm">{!row.checked ? '✓' : '—'}</span>
                                                )}
                                            </td>
                                            <td className="py-1.5 px-2 sm:py-2.5 sm:px-3 align-middle min-w-0">
                                                {canUpdate ? (
                                                    <Input
                                                        type="text"
                                                        value={row.note}
                                                        onChange={(e) => setChecklistRow(sc.id, 'note', e.target.value)}
                                                        placeholder="Obs."
                                                        className="h-8 sm:h-9 border-content-border text-xs sm:text-sm min-w-0 max-w-full"
                                                    />
                                                ) : (
                                                    <span className="text-muted-foreground text-xs sm:text-sm block truncate max-w-full" title={row.note || undefined}>{row.note || '—'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </form>
    );
}
