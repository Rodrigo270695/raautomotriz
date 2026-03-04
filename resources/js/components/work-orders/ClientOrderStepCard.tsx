import * as React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'cyan' | 'amber' | 'violet' | 'emerald' | 'sky' | 'fuchsia';

const toneClasses: Record<
    Tone,
    {
        headerAccent: string;
        chipBg: string;
        chipDot: string;
        glow: string;
    }
> = {
    cyan: {
        headerAccent: 'text-cyan-200',
        chipBg: 'bg-cyan-500/12',
        chipDot: 'bg-cyan-300',
        glow: 'from-cyan-500/35 via-sky-500/10 to-slate-950',
    },
    sky: {
        headerAccent: 'text-sky-200',
        chipBg: 'bg-sky-500/12',
        chipDot: 'bg-sky-300',
        glow: 'from-sky-500/35 via-cyan-500/10 to-slate-950',
    },
    amber: {
        headerAccent: 'text-amber-200',
        chipBg: 'bg-amber-500/12',
        chipDot: 'bg-amber-300',
        glow: 'from-amber-400/30 via-amber-500/8 to-slate-950',
    },
    violet: {
        headerAccent: 'text-violet-200',
        chipBg: 'bg-violet-500/12',
        chipDot: 'bg-violet-300',
        glow: 'from-violet-500/30 via-fuchsia-500/10 to-slate-950',
    },
    emerald: {
        headerAccent: 'text-emerald-200',
        chipBg: 'bg-emerald-500/12',
        chipDot: 'bg-emerald-300',
        glow: 'from-emerald-500/30 via-emerald-400/10 to-slate-950',
    },
    fuchsia: {
        headerAccent: 'text-fuchsia-200',
        chipBg: 'bg-fuchsia-500/12',
        chipDot: 'bg-fuchsia-300',
        glow: 'from-fuchsia-500/40 via-violet-500/12 to-slate-950',
    },
};

type Props = {
    title: string;
    subtitle?: string;
    tag?: string;
    icon?: React.ReactNode;
    tone?: Tone;
    className?: string;
    children: React.ReactNode;
};

export function ClientOrderStepCard({
    title,
    subtitle,
    tag,
    icon,
    tone = 'cyan',
    className,
    children,
}: Props) {
    const toneCfg = toneClasses[tone];

    return (
        <section
            className={cn(
                'relative overflow-hidden rounded-2xl border border-slate-800/70 bg-linear-to-b from-slate-950 via-slate-950/95 to-black text-slate-50 shadow-[0_18px_45px_rgba(15,23,42,0.7)] animate-in fade-in-0 slide-in-from-bottom-4',
                className,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute inset-x-6 -top-32 h-48 rounded-full blur-3xl',
                    'bg-linear-to-b',
                    toneCfg.glow,
                )}
                aria-hidden
            />

            <div className="relative flex flex-col gap-4 px-5 pb-5 pt-4 sm:px-6 sm:pt-5 sm:pb-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        {icon && (
                            <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/80 text-slate-100 shadow-[0_0_0_1px_rgba(15,23,42,0.8),0_0_18px_rgba(15,23,42,0.8)]">
                                {icon}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <p
                                className={cn(
                                    'text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400',
                                    toneCfg.headerAccent,
                                )}
                            >
                                {title}
                            </p>
                            {subtitle && (
                                <p className="mt-1 text-sm text-slate-200/90">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {tag && (
                        <span
                            className={cn(
                                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium text-slate-100 shadow-[0_0_18px_rgba(148,163,184,0.45)]',
                                toneCfg.chipBg,
                            )}
                        >
                            <span
                                className={cn(
                                    'size-1.5 rounded-full',
                                    toneCfg.chipDot,
                                )}
                            />
                            {tag}
                        </span>
                    )}
                </header>

                <div className="relative rounded-xl border border-slate-800/80 bg-slate-950/60 px-4 py-4 sm:px-5 sm:py-5">
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_55%)] opacity-90" />
                    <div className="relative space-y-4 text-sm text-slate-100/90">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}

