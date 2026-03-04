import * as React from 'react';
import { cn } from '@/lib/utils';

export type TimelineStepId = string;

export type TimelineStep = {
    id: TimelineStepId;
    label: string;
    description?: string;
    icon?: React.ReactNode;
};

type Props = {
    steps: TimelineStep[];
    /** Estado real de la orden: hasta aquí se pinta la línea y se habilitan pasos. */
    currentStatusId: TimelineStepId;
    activeStepId: TimelineStepId | null;
    onStepChange?(id: TimelineStepId): void;
};

export function ClientOrderTimelineResponsive({ steps, currentStatusId, activeStepId, onStepChange }: Props) {
    const currentIndex = steps.findIndex((step) => step.id === currentStatusId);
    const activeIndex = activeStepId
        ? steps.findIndex((step) => step.id === activeStepId)
        : -1;

    const displayIndex = activeIndex >= 0 ? activeIndex : currentIndex;
    const displayStep = displayIndex >= 0 ? steps[displayIndex] : null;

    const totalSegments = Math.max(steps.length - 1, 1);
    const progressRatio =
        currentIndex <= 0
            ? 0
            : Math.min(currentIndex, totalSegments) / totalSegments;
    const progressPercent = `${progressRatio * 100}%`;

    const handleClick = (id: TimelineStepId, disabled: boolean) => {
        if (disabled || !onStepChange) return;
        onStepChange(id);
    };

    const isDelivered = currentStatusId === 'entregado';
    const progressColorClass = isDelivered ? 'bg-emerald-600' : 'bg-[#1c2d4f]';
    const completedStepClass = isDelivered
        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
        : 'border-[#1c2d4f] bg-[#1c2d4f] text-white shadow-md';
    const currentStepClass = isDelivered
        ? 'border-emerald-600 bg-white text-emerald-600 shadow'
        : 'border-red-600 bg-white text-red-600 shadow';
    const completedLabelClass = isDelivered ? 'text-emerald-700' : 'text-[#1c2d4f]';
    const currentLabelClass = isDelivered ? 'text-emerald-600' : 'text-red-600';
    const pingClass = isDelivered ? 'bg-emerald-500/30' : 'bg-[#1c2d4f]/30';
    const pingClassCurrent = isDelivered ? 'bg-emerald-500/30' : 'bg-red-500/30';
    const pingBgClass = isDelivered ? 'bg-emerald-500/15' : 'bg-[#1c2d4f]/15';
    const pingBgClassCurrent = isDelivered ? 'bg-emerald-500/15' : 'bg-red-500/18';

    return (
        <section aria-label="Estado de la orden" className="relative space-y-3">
            <header className="flex items-baseline justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-800/80">
                        Estado de la orden
                    </p>
                </div>

                <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-700 sm:inline-flex">
                    {currentIndex + 1 > 0 ? `${currentIndex + 1} de ${steps.length} etapas` : `0 de ${steps.length} etapas`}
                </span>
            </header>

            {/* Versión horizontal – móviles */}
            <div className="sm:hidden">
                <div className="relative px-1.5 pt-2 pb-3">
                    <div
                        className="pointer-events-none absolute left-4 right-8 top-5 overflow-hidden"
                        aria-hidden
                    >
                        <div className="h-[2px] w-full rounded-full bg-slate-200" />
                        <div
                            className={cn('absolute left-0 top-0 h-[2px] rounded-full', progressColorClass)}
                            style={{ width: progressPercent }}
                        />
                    </div>
                    <ol className="relative flex items-center justify-between gap-1">
                        {steps.map((step, index) => {
                        const isCurrent = index === currentIndex;
                        const isSelected = index === activeIndex;
                            const isCompleted = currentIndex >= 0 && index < currentIndex;
                            const isFuture = currentIndex >= 0 && index > currentIndex;
                            const disabled = isFuture || currentIndex < 0;

                            return (
                                <li
                                    key={step.id}
                                    className="flex flex-1 flex-col items-center"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleClick(step.id, disabled)}
                                        className={cn(
                                            'flex size-7 items-center justify-center rounded-full border-2 bg-white text-[11px] font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                                            isCompleted && completedStepClass,
                                            isCurrent && currentStepClass,
                                            isFuture &&
                                                'border-slate-300 text-slate-400',
                                            disabled
                                                ? 'cursor-not-allowed opacity-70'
                                                : 'cursor-pointer',
                                        )}
                                    >
                                        {isSelected && (
                                            <>
                                                <span
                                                    className={cn(
                                                        'pointer-events-none absolute inline-flex h-9 w-9 rounded-full blur-[1px] animate-ping',
                                                        isCurrent ? pingClassCurrent : pingClass,
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        'pointer-events-none absolute inline-flex h-7 w-7 rounded-full opacity-70',
                                                        isCurrent ? pingBgClassCurrent : pingBgClass,
                                                    )}
                                                />
                                            </>
                                        )}
                                        {step.icon ? (
                                            <span className="relative flex size-4 shrink-0 items-center justify-center text-current [&>svg]:size-3.5">
                                                {step.icon}
                                            </span>
                                        ) : (
                                            <span className="relative block size-2 rounded-full bg-current" />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                    {displayStep && (
                        <p
                            className={cn(
                                'mt-3 text-center text-xs font-medium',
                                isDelivered && displayIndex === currentIndex ? 'text-emerald-600' : 'text-slate-700',
                            )}
                        >
                            {displayStep.label}
                        </p>
                    )}
                </div>
            </div>

            {/* Versión horizontal – pantallas medianas / grandes */}
            <div className="hidden sm:block">
                <div className="relative px-4 pt-2 pb-1">
                    <div
                        className="pointer-events-none absolute left-10 right-16 top-7 overflow-hidden"
                        aria-hidden
                    >
                        <div className="h-[2px] w-full rounded-full bg-slate-200" />
                        <div
                            className={cn('absolute left-0 top-0 h-[2px] rounded-full', progressColorClass)}
                            style={{ width: progressPercent }}
                        />
                    </div>
                    <ol className="relative flex items-start justify-between gap-4">
                        {steps.map((step, index) => {
                        const isCurrent = index === currentIndex;
                        const isSelected = index === activeIndex;
                            const isCompleted = currentIndex >= 0 && index < currentIndex;
                            const isFuture = currentIndex >= 0 && index > currentIndex;
                            const disabled = isFuture || currentIndex < 0;

                            return (
                                <li
                                    key={step.id}
                                    className="flex flex-1 flex-col items-center gap-2"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleClick(step.id, disabled)}
                                        className={cn(
                                            'relative flex size-9 items-center justify-center rounded-full border-2 bg-white text-xs font-semibold shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                                            isCompleted && completedStepClass,
                                            isCurrent && currentStepClass,
                                            isFuture &&
                                                'border-slate-300 text-slate-400',
                                            disabled
                                                ? 'cursor-not-allowed opacity-70'
                                                : 'cursor-pointer',
                                        )}
                                    >
                                        {isSelected && (
                                            <>
                                                <span
                                                    className={cn(
                                                        'pointer-events-none absolute inline-flex h-11 w-11 rounded-full blur-[1px] animate-ping',
                                                        isCurrent ? pingClassCurrent : pingClass,
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        'pointer-events-none absolute inline-flex h-9 w-9 rounded-full opacity-70',
                                                        isCurrent ? pingBgClassCurrent : pingBgClass,
                                                    )}
                                                />
                                            </>
                                        )}
                                        <span className="relative flex items-center justify-center">
                                            {step.icon ?? index + 1}
                                        </span>
                                    </button>
                                    <p
                                        className={cn(
                                            'max-w-[7rem] text-center text-xs font-medium',
                                            isCompleted && completedLabelClass,
                                            isCurrent && currentLabelClass,
                                            isFuture && 'text-slate-500',
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </section>
    );
}

