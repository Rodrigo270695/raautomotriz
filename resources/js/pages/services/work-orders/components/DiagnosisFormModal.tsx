import { router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { WorkOrderDiagnosisItem } from '../types';

const PERU_TZ = 'America/Lima';

/** Fecha y hora actual en Perú en formato YYYY-MM-DDTHH:mm para input datetime-local */
function nowPeruDateTimeLocal(): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: PERU_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(new Date());
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

type DiagnosisFormModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    diagnosis: WorkOrderDiagnosisItem | null;
    diagnosesBasePath: string;
};

export function DiagnosisFormModal({
    open,
    onOpenChange,
    diagnosis,
    diagnosesBasePath,
}: DiagnosisFormModalProps) {
    const isEdit = diagnosis !== null;

    const { data, setData, post, processing: postProcessing, errors, reset } = useForm({
        diagnosis_text: '',
        diagnosed_at: '',
        internal_notes: '',
    });
    const [editForm, setEditForm] = useState({ diagnosis_text: '', diagnosed_at: '', internal_notes: '' });
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (diagnosis) {
            setEditForm({
                diagnosis_text: diagnosis.diagnosis_text,
                diagnosed_at: diagnosis.diagnosed_at ? diagnosis.diagnosed_at.slice(0, 16) : '',
                internal_notes: diagnosis.internal_notes ?? '',
            });
        } else {
            reset();
            setData({
                diagnosis_text: '',
                diagnosed_at: nowPeruDateTimeLocal(),
                internal_notes: '',
            });
        }
    }, [open, diagnosis, setData, reset]);

    const handleSubmitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!diagnosesBasePath) return;
        post(diagnosesBasePath, {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                setData({ diagnosis_text: '', diagnosed_at: '', internal_notes: '' });
            },
        });
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!diagnosis || !diagnosesBasePath) return;
        setSavingEdit(true);
        router.put(`${diagnosesBasePath}/${diagnosis.id}`, {
            diagnosis_text: editForm.diagnosis_text,
            diagnosed_at: editForm.diagnosed_at || null,
            internal_notes: editForm.internal_notes || null,
        }, {
            onSuccess: () => onOpenChange(false),
            onFinish: () => setSavingEdit(false),
        });
    };

    const handleSubmit = isEdit ? handleSubmitEdit : handleSubmitCreate;
    const processing = isEdit ? savingEdit : postProcessing;
    const diagnosisText = (isEdit ? editForm.diagnosis_text : data.diagnosis_text).trim();
    const canSubmit = diagnosisText.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-content-border bg-card w-[calc(100%-1rem)] max-w-lg sm:w-full">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <Stethoscope className="size-5 text-muted-foreground" />
                        {isEdit ? 'Editar diagnóstico' : 'Nuevo diagnóstico'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {isEdit ? 'Modifica el texto del diagnóstico, fecha y notas internas.' : 'Registra el diagnóstico, fecha y opcionalmente notas internas.'}
                    </DialogDescription>
                </DialogHeader>
                <Separator className="bg-content-border" />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="diag-text" className="text-muted-foreground text-xs font-medium">Diagnóstico <span className="text-red-500">*</span></Label>
                        <textarea
                            id="diag-text"
                            value={isEdit ? editForm.diagnosis_text : data.diagnosis_text}
                            onChange={(e) => isEdit
                                ? setEditForm((prev) => ({ ...prev, diagnosis_text: e.target.value }))
                                : setData('diagnosis_text', e.target.value)}
                            placeholder="Falla, piezas, recomendación..."
                            className="flex min-h-[100px] w-full rounded-md border border-content-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            required
                        />
                        {errors.diagnosis_text && <p className="text-sm text-destructive">{errors.diagnosis_text}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="diag-at" className="text-muted-foreground text-xs font-medium">Fecha y hora</Label>
                        <Input
                            id="diag-at"
                            type="datetime-local"
                            value={isEdit ? editForm.diagnosed_at : data.diagnosed_at}
                            onChange={(e) => isEdit
                                ? setEditForm((prev) => ({ ...prev, diagnosed_at: e.target.value }))
                                : setData('diagnosed_at', e.target.value)}
                            className="border-content-border"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="diag-notes" className="text-muted-foreground text-xs font-medium">Notas internas</Label>
                        <textarea
                            id="diag-notes"
                            value={isEdit ? editForm.internal_notes : data.internal_notes}
                            onChange={(e) => isEdit
                                ? setEditForm((prev) => ({ ...prev, internal_notes: e.target.value }))
                                : setData('internal_notes', e.target.value)}
                            placeholder="No visibles para el cliente"
                            className="flex min-h-[60px] w-full rounded-md border border-content-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing || !canSubmit} className="cursor-pointer">
                            {processing ? 'Guardando…' : (isEdit ? 'Guardar' : 'Guardar diagnóstico')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
