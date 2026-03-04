import * as React from 'react';
import { cn } from '@/lib/utils';

const ORDER_TIMELINE_STEPS = [
    {
        id: 'ingreso',
        label: 'Ingreso',
        description: 'Recepción del vehículo en el taller.',
    },
    {
        id: 'checklist',
        label: 'Checklist',
        description: 'Revisión inicial y registro de hallazgos.',
    },
    {
        id: 'diagnostico',
        label: 'Diagnóstico',
        description: 'Análisis detallado y confirmación de fallas.',
    },
    {
        id: 'reparacion',
        label: 'Reparación',
        description: 'Ejecución de los trabajos aprobados.',
    },
    {
        id: 'listo_para_entregar',
        label: 'Listo para entregar',
        description: 'Validaciones finales y control de calidad.',
    },
    {
        id: 'entregado',
        label: 'Entregado',
        description: 'Cierre de orden y salida del vehículo.',
    },
] as const;

export type OrderTimelineStepId = (typeof ORDER_TIMELINE_STEPS)[number]['id'];

type Props = {
    /** Paso actual de la orden (uno de los 6 definidos) */
    currentStep: OrderTimelineStepId;
    onStepChange?(step: OrderTimelineStepId): void;
    /** Desactiva la interacción si solo quieres mostrar el estado. */
    readOnly?: boolean;
};

export function ClientOrderTimeline({ currentStep, onStepChange, readOnly }: Props) {
    const currentIndex = Math.max(
        0,
        ORDER_TIMELINE_STEPS.findIndex((step) => step.id === currentStep),
    );

    return (
        <section
            aria-label="Línea de tiempo de la orden"
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-slate-900 to-red-600" />

            <header className="mb-4 flex items-baseline justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-800/80">
                        Línea de tiempo
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                        Seguimiento del estado de la orden
                    </p>
                </div>

                <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-800">
                    {currentIndex + 1} de 6 etapas
                </span>
            </header>

            <ol className="relative mt-1 space-y-4">
                {ORDER_TIMELINE_STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isFuture = index > currentIndex;
                    const isClickable = !readOnly && (isCompleted || isCurrent);

                    const handleClick = () => {
                        if (!isClickable || !onStepChange) return;
                        onStepChange(step.id);
                    };

                    return (
                        <li
                            key={step.id}
                            className={cn(
                                'relative flex items-start gap-3 pl-4',
                                !isClickable && !readOnly && 'cursor-not-allowed opacity-70',
                            )}
                        >
                            {/* Conector superior entre puntos */}
                            {index > 0 && (
                                <span
                                    aria-hidden
                                    className={cn(
                                        'pointer-events-none absolute left-[17px] top-[-14px] h-7 w-[2px] rounded-full',
                                        isCompleted ? 'bg-red-600' : 'bg-slate-300',
                                    )}
                                />
                            )}

                            {/* Conector inferior entre puntos */}
                            {index < ORDER_TIMELINE_STEPS.length - 1 && (
                                <span
                                    aria-hidden
                                    className={cn(
                                        'pointer-events-none absolute left-[17px] top-[22px] h-7 w-[2px] rounded-full',
                                        index < currentIndex - 1
                                            ? 'bg-red-600'
                                            : index === currentIndex - 1
                                                ? 'bg-gradient-to-b from-red-600 to-slate-400'
                                                : 'bg-slate-300',
                                    )}
                                />
                            )}

                            <button
                                type="button"
                                onClick={handleClick}
                                disabled={!isClickable}
                                className={cn(
                                    'relative mt-0.5 flex size-7 items-center justify-center rounded-full border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                                    isCompleted &&
                                        'border-red-600 bg-red-600 text-white shadow-md',
                                    isCurrent &&
                                        'border-red-600 bg-white text-red-600 shadow',
                                    isFuture && 'border-slate-300 bg-white text-slate-400',
                                    isClickable && 'hover:scale-[1.03]',
                                )}
                                aria-label={`${index + 1}. ${step.label}`}
                            >
                                <span className="text-[11px] font-semibold">
                                    {index + 1}
                                </span>

                                {isCurrent && (
                                    <span className="pointer-events-none absolute inset-0 -z-10 scale-125 rounded-full bg-red-500/20 blur-md" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleClick}
                                disabled={!isClickable}
                                className={cn(
                                    'flex-1 rounded-lg px-3 py-1.5 text-left transition-colors',
                                    isClickable && 'hover:bg-slate-50',
                                )}
                            >
                                <p
                                    className={cn(
                                        'text-sm font-semibold',
                                        isCompleted && 'text-slate-900',
                                        isCurrent && 'text-red-600',
                                        isFuture && 'text-slate-400',
                                    )}
                                >
                                    {step.label}
                                </p>
                                {step.description && (
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {step.description}
                                    </p>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}

