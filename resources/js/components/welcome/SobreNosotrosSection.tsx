import { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { Flag, Eye, Heart, Wrench, Shield, Clock, ChevronRight } from 'lucide-react';

/* ── Data ───────────────────────────────────────────────────────────────── */
const PILLARS = [
    { label: 'Misión',         icon: Flag,  color: '#D9252A', text: 'Ofrecer servicios de mecánica automotriz de la más alta calidad, con honestidad y trato cercano, para que tu vehículo recupere su rendimiento y tú tengas tranquilidad en cada kilómetro.' },
    { label: 'Visión',         icon: Eye,   color: '#1E2D4A', text: 'Ser el taller de referencia en la zona, reconocido por profesionalidad, equipamiento actualizado y un equipo comprometido con la seguridad y satisfacción de cada cliente.' },
    { label: 'Nuestros valores', icon: Heart, color: '#D9252A', text: 'Trabajo bien hecho, transparencia en presupuestos, uso de repuestos de calidad y un trato humano. Tu confianza es nuestra mejor carta de presentación.' },
] as const;

const WHY_TRUST = [
    { icon: Wrench, title: 'Experiencia y dedicación',  text: 'Años de trayectoria y formación continua para ofrecerte el mejor diagnóstico y reparación.' },
    { icon: Shield, title: 'Transparencia total',       text: 'Presupuestos claros, sin sorpresas. Te explicamos cada detalle antes de actuar.' },
    { icon: Heart,  title: 'Atención cercana',          text: 'Técnicos con trato humano. Aquí no eres un número, eres parte de la familia.' },
    { icon: Clock,  title: 'Compromiso con tu tiempo',  text: 'Respetamos tus plazos y te mantenemos informado en cada paso del servicio.' },
] as const;

const STATS = [
    { value: '+10',  label: 'Años de experiencia' },
    { value: '100%', label: 'Compromiso con tu seguridad' },
    { value: '500+', label: 'Clientes satisfechos' },
] as const;

// Galería curada para "Sobre nosotros"
const GALLERY = [1, 4, 8, 12, 15, 19];

/* ── Sub-components ─────────────────────────────────────────────────────── */

/** Hero de página interior con imagen de fondo del taller */
function Hero() {
    return (
        <header className="relative flex min-h-[92vh] items-end overflow-hidden">
            {/* Imagen de fondo */}
            <img
                src="/ra/dise%C3%B1o/9.jpeg"
                alt="Taller RA AUTOMOTRIZ"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-[#0d1929]/65" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-[#FDFDFC] dark:from-[#0a0a0a] to-transparent" aria-hidden />

            {/* Content */}
            <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
                <motion.span
                    className="mb-3 inline-block rounded-full bg-[#D9252A]/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Quiénes somos
                </motion.span>
                <motion.h1
                    className="text-4xl font-extrabold leading-tight text-white drop-shadow sm:text-5xl md:text-6xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.55 }}
                >
                    Sobre <span className="text-[#D9252A]">RA AUTOMOTRIZ</span>
                </motion.h1>
                <motion.p
                    className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    No solo reparamos autos: cuidamos lo que te lleva a diario con vocación,
                    herramientas actualizadas y un compromiso real con cada cliente.
                </motion.p>
            </div>
        </header>
    );
}

/** Stats en franja navy */
function StatsStrip() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });

    return (
        <div ref={ref} className="bg-[#1E2D4A]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-3 divide-x divide-white/10">
                    {STATS.map((s, i) => (
                        <motion.div
                            key={s.label}
                            className="flex flex-col items-center gap-1 py-10 text-center"
                            initial={{ opacity: 0, y: 16 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.45, delay: 0.1 * i }}
                        >
                            <span className="text-3xl font-extrabold text-[#D9252A] sm:text-4xl">{s.value}</span>
                            <span className="text-xs font-medium text-white/70 sm:text-sm">{s.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Misión, Visión, Valores */
function PillarsSection() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section className="bg-[#FDFDFC] py-20 dark:bg-[#0a0a0a]" aria-labelledby="pillars-title">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    className="mb-14 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <span className="mb-3 inline-block rounded-full bg-[#D9252A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">
                        Pilares
                    </span>
                    <h2 id="pillars-title" className="text-3xl font-extrabold text-[#1E2D4A] sm:text-4xl dark:text-white">
                        Lo que nos guía cada día
                    </h2>
                </motion.div>

                <div className="grid gap-8 sm:grid-cols-3">
                    {PILLARS.map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <motion.article
                                key={p.label}
                                className="group rounded-2xl border border-[#1E2D4A]/8 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/8 dark:bg-[#0d1929]/60"
                                initial={{ opacity: 0, y: 28 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.45, delay: 0.1 * i }}
                            >
                                <div
                                    className="mb-4 flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                                    style={{ background: `${p.color}18` }}
                                >
                                    <Icon className="size-6" style={{ color: p.color }} />
                                </div>
                                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#D9252A]">{p.label}</h3>
                                <p className="text-sm leading-relaxed text-[#1E2D4A]/70 dark:text-white/60">{p.text}</p>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/** Galería de fotos del taller */
function WorkshopGallery() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section className="bg-[#F7F7F5] py-16 dark:bg-[#0d1929]/40" aria-label="Galería">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    className="mb-10 text-center"
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">
                        Instalaciones
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#1E2D4A] dark:text-white">
                        Nuestro espacio de trabajo
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {GALLERY.map((n, i) => (
                        <motion.div
                            key={n}
                            className={`overflow-hidden rounded-2xl ${i === 0 ? 'col-span-2 row-span-2 sm:col-span-2' : ''}`}
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={inView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.45, delay: 0.07 * i }}
                        >
                            <img
                                src={`/ra/dise%C3%B1o/${n}.jpeg`}
                                alt={`Taller RA AUTOMOTRIZ`}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                style={{ minHeight: i === 0 ? '260px' : '130px' }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/** Por qué confiar en nosotros */
function WhyTrustSection() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section
            className="bg-[#FDFDFC] py-20 dark:bg-[#0a0a0a]"
            aria-labelledby="why-trust-title"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(30,45,74,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    className="mb-14 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <span className="mb-3 inline-block rounded-full bg-[#D9252A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">
                        Tu tranquilidad, nuestra prioridad
                    </span>
                    <h2 id="why-trust-title" className="text-3xl font-extrabold text-[#1E2D4A] sm:text-4xl dark:text-white">
                        Por qué confiar en nosotros
                    </h2>
                </motion.div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {WHY_TRUST.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.title}
                                className="group flex flex-col gap-4"
                                initial={{ opacity: 0, y: 24 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.45, delay: 0.1 * i }}
                            >
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#D9252A]/10 transition-transform duration-300 group-hover:scale-105">
                                    <Icon className="size-7 text-[#D9252A]" />
                                </div>
                                <h3 className="text-sm font-bold text-[#1E2D4A] dark:text-white">{item.title}</h3>
                                <p className="text-sm leading-relaxed text-[#1E2D4A]/60 dark:text-white/50">{item.text}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/** CTA final */
function CtaBlock() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });

    return (
        <section className="relative overflow-hidden bg-[#1E2D4A] py-20">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute -right-20 -top-20 size-72 rounded-full bg-[#D9252A]/15 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-white/5 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 24 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.55 }}
                >
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">Tu próximo paso</p>
                    <h2 className="mb-5 text-3xl font-extrabold text-white sm:text-4xl">
                        Te esperamos en el taller
                    </h2>
                    <p className="mb-10 text-base text-white/65">
                        Somos el equipo que cuida tu vehículo como se merece.
                        Sin citas previas, de lunes a sábado.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/servicios"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#D9252A] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#D9252A]/25 transition-all hover:bg-[#c21f24] hover:-translate-y-0.5"
                        >
                            Ver nuestros servicios <ChevronRight className="size-4" />
                        </Link>
                        <Link
                            href="/contacto"
                            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5"
                        >
                            Contactar
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ── Main export ──────────────────────────────────────────────────────────── */
export default function SobreNosotrosSection() {
    return (
        <article id="sobre-nosotros">
            <Hero />
            <StatsStrip />
            <PillarsSection />
            <WorkshopGallery />
            <WhyTrustSection />
            <CtaBlock />
        </article>
    );
}
