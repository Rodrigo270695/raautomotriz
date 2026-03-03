import { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import {
    Wrench, Zap, Gauge, Droplets, Paintbrush2,
    Target, Flame, Navigation, Car, ChevronRight,
} from 'lucide-react';

const SERVICES = [
    { icon: Wrench,      title: 'Reparación de motores',     desc: 'Diagnóstico y reparación completa con tecnología de punta.' },
    { icon: Car,         title: 'Suspensión',                desc: 'Amortiguadores, resortes y componentes de suspensión.' },
    { icon: Navigation,  title: 'Dirección',                 desc: 'Caja de dirección, cremallera y columna.' },
    { icon: Gauge,       title: 'Frenos',                    desc: 'Pastillas, discos, cilindros y líquido de frenos.' },
    { icon: Zap,         title: 'Sistema eléctrico',         desc: 'Diagnóstico y reparación eléctrica y electrónica.' },
    { icon: Target,      title: 'Scanner automotriz',        desc: 'Diagnóstico OBD2 para todos los modelos.' },
    { icon: Droplets,    title: 'Cambio de aceite',          desc: 'Aceite y filtros con lubricantes de alta calidad.' },
    { icon: Paintbrush2, title: 'Planchado y pintura',       desc: 'Cabina profesional con pinturas de primera calidad.' },
    { icon: Target,      title: 'Alineamiento y balanceo',   desc: 'Alineación computarizada y balanceo dinámico.' },
    { icon: Flame,       title: 'Instalación de GLP',        desc: 'Conversión y mantenimiento de sistemas GLP.' },
];

export default function ServicesSection() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section id="servicios" className="bg-[#FDFDFC] py-20 dark:bg-[#0a0a0a]" aria-label="Nuestros servicios">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <motion.div
                    ref={ref}
                    className="mb-14 text-center"
                    initial={{ opacity: 0, y: 24 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.55 }}
                >
                    <span className="mb-3 inline-block rounded-full bg-[#D9252A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">
                        Servicios
                    </span>
                    <h2 className="text-3xl font-extrabold text-[#1E2D4A] sm:text-4xl dark:text-white">
                        Todo lo que tu vehículo necesita
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-[#1E2D4A]/60 dark:text-white/50">
                        Técnicos certificados y equipos modernos para el mejor servicio automotriz en Chiclayo.
                    </p>
                </motion.div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {SERVICES.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.article
                                key={s.title}
                                className="group relative overflow-hidden rounded-2xl border border-[#1E2D4A]/8 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D9252A]/30 hover:shadow-lg dark:border-white/8 dark:bg-[#0d1929]/60"
                                initial={{ opacity: 0, y: 32 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.45, delay: 0.05 * i }}
                            >
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                    style={{ background: 'radial-gradient(circle at 20% 20%, rgba(217,37,42,0.05), transparent 70%)' }}
                                    aria-hidden
                                />
                                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[#1E2D4A]/8 transition-colors group-hover:bg-[#D9252A]/10 dark:bg-white/8">
                                    <Icon className="size-5 text-[#1E2D4A] transition-colors group-hover:text-[#D9252A] dark:text-white/80" />
                                </div>
                                <h3 className="mb-1.5 text-sm font-bold text-[#1E2D4A] dark:text-white">{s.title}</h3>
                                <p className="text-xs leading-relaxed text-[#1E2D4A]/55 dark:text-white/45">{s.desc}</p>
                            </motion.article>
                        );
                    })}
                </div>

                <div className="mt-10 text-center">
                    <Link
                        href="/servicios"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1E2D4A] px-8 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#2a3d5c] hover:-translate-y-0.5 hover:shadow-md"
                    >
                        Ver todos los servicios <ChevronRight className="size-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
