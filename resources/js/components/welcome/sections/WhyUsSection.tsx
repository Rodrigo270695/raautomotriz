import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Gauge, ShieldCheck, Award, CheckCircle } from 'lucide-react';

const ITEMS = [
    { icon: Gauge,       title: 'Diagnóstico digital',          desc: 'Equipos de scanner OBD2 para identificar fallas con precisión y rapidez.' },
    { icon: ShieldCheck, title: 'Garantía en todos los trabajos', desc: 'Respaldamos cada servicio con garantía escrita para tu tranquilidad.' },
    { icon: Award,       title: 'Técnicos certificados',        desc: 'Personal capacitado y actualizado en las últimas tecnologías automotrices.' },
    { icon: CheckCircle, title: 'Repuestos de calidad',         desc: 'Solo usamos repuestos originales o de primera línea con procedencia garantizada.' },
];

export default function WhyUsSection() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section className="bg-[#FDFDFC] py-20 dark:bg-[#0a0a0a]" aria-label="Por qué elegirnos">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div ref={ref} className="grid items-center gap-12 lg:grid-cols-2">

                    {/* Image collage */}
                    <motion.div
                        className="relative hidden h-96 lg:block"
                        initial={{ opacity: 0, x: -24 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <img src="/ra/dise%C3%B1o/6.jpeg"  alt="" loading="lazy" className="absolute left-0  top-0   h-56 w-2/3 rounded-2xl object-cover shadow-xl" />
                        <img src="/ra/dise%C3%B1o/11.jpeg" alt="" loading="lazy" className="absolute right-0 top-8   h-48 w-1/2 rounded-2xl object-cover shadow-xl" />
                        <img src="/ra/dise%C3%B1o/18.jpeg" alt="" loading="lazy" className="absolute bottom-0 left-8 h-40 w-1/2 rounded-2xl object-cover shadow-xl" />
                        <div className="absolute bottom-4 right-0 rounded-2xl bg-[#D9252A] px-5 py-3 text-white shadow-lg">
                            <p className="text-2xl font-extrabold">10+</p>
                            <p className="text-xs font-medium opacity-90">Años de experiencia</p>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <span className="mb-3 inline-block rounded-full bg-[#D9252A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">
                            ¿Por qué elegirnos?
                        </span>
                        <h2 className="mb-8 text-3xl font-extrabold text-[#1E2D4A] sm:text-4xl dark:text-white">
                            Tu vehículo merece lo mejor
                        </h2>
                        <div className="space-y-6">
                            {ITEMS.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.title}
                                        className="flex gap-4"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={inView ? { opacity: 1, y: 0 } : {}}
                                        transition={{ duration: 0.4, delay: 0.2 + 0.1 * i }}
                                    >
                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#1E2D4A]/8 dark:bg-white/8">
                                            <Icon className="size-5 text-[#1E2D4A] dark:text-white/80" />
                                        </div>
                                        <div>
                                            <h3 className="mb-1 text-sm font-bold text-[#1E2D4A] dark:text-white">{item.title}</h3>
                                            <p className="text-sm text-[#1E2D4A]/60 dark:text-white/50">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
