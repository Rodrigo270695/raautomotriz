import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Award, Wrench, CalendarCheck } from 'lucide-react';

const STATS = [
    { value: 500, suffix: '+', label: 'Clientes satisfechos',    icon: Users },
    { value: 10,  suffix: '+', label: 'Años de experiencia',     icon: Award },
    { value: 10,  suffix: '',  label: 'Servicios especializados', icon: Wrench },
    { value: 98,  suffix: '%', label: 'Clientes que regresan',   icon: CalendarCheck },
];

function useCountUp(target: number, start: boolean, duration = 1600) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let t0: number | null = null;
        const step = (ts: number) => {
            if (!t0) t0 = ts;
            const p = Math.min((ts - t0) / duration, 1);
            setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return count;
}

function StatItem({ stat, delay }: { stat: typeof STATS[0]; delay: number }) {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const num    = useCountUp(stat.value, inView);
    const Icon   = stat.icon;

    return (
        <motion.div
            ref={ref}
            className="flex flex-col items-center gap-3 p-6 text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay }}
        >
            <div className="flex size-12 items-center justify-center rounded-full bg-[#D9252A]/10">
                <Icon className="size-6 text-[#D9252A]" />
            </div>
            <p className="text-4xl font-extrabold tracking-tight text-[#1E2D4A] dark:text-white">
                {num}{stat.suffix}
            </p>
            <p className="text-sm font-medium text-[#1E2D4A]/60 dark:text-white/50">{stat.label}</p>
        </motion.div>
    );
}

export default function StatsBar() {
    return (
        <section className="border-y border-[#1E2D4A]/8 bg-white dark:bg-[#0d1929]/60" aria-label="Estadísticas">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 divide-x divide-y divide-[#1E2D4A]/8 sm:grid-cols-4 sm:divide-y-0 dark:divide-white/8">
                    {STATS.map((s, i) => <StatItem key={s.label} stat={s} delay={i * 0.1} />)}
                </div>
            </div>
        </section>
    );
}
