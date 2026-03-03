import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, ExternalLink, BadgeCheck } from 'lucide-react';
import { CONTACT } from '@/data/contact';

/* ── Data ───────────────────────────────────────────────────────────────── */
const OVERALL_RATING = 4.9;
const TOTAL_REVIEWS  = 47;

const TESTIMONIALS = [
    { name: 'Carlos Mendoza',   initials: 'CM', color: '#1E2D4A', rating: 5, date: 'hace 2 semanas',  service: 'Reparación de motor',      text: 'Excelente servicio. Diagnóstico muy preciso y trabajo garantizado. El motor quedó como nuevo. 100% recomendado.' },
    { name: 'Rosa Torres',      initials: 'RT', color: '#D9252A', rating: 5, date: 'hace 1 mes',      service: 'Frenos y suspensión',       text: 'Muy profesionales. Me explicaron todo antes de empezar. Precio justo y el carro salió perfecto. Definitivamente regreso.' },
    { name: 'Jorge Llontop',    initials: 'JL', color: '#2563eb', rating: 5, date: 'hace 2 meses',    service: 'Scanner + mantenimiento',   text: 'Llevo 3 años trayendo mis vehículos acá. Siempre calidad, puntualidad y honestidad. El mejor taller de Chiclayo sin duda.' },
    { name: 'Ana Flores',       initials: 'AF', color: '#059669', rating: 5, date: 'hace 3 meses',    service: 'Cambio de aceite',           text: 'Rápidos, amables y muy transparentes con los precios. Ya mandé a toda mi familia. Confío plenamente en ellos.' },
    { name: 'Miguel Castillo',  initials: 'MC', color: '#7c3aed', rating: 5, date: 'hace 4 meses',    service: 'Planchado y pintura',        text: 'El trabajo de planchado y pintura quedó impecable. No se nota donde estuvo dañado. Profesionalismo total.' },
    { name: 'Patricia Vásquez', initials: 'PV', color: '#b45309', rating: 5, date: 'hace 5 meses',    service: 'Sistema eléctrico',          text: 'Tenía una falla eléctrica que en otros talleres no encontraban. Aquí lo resolvieron en el día. Muy recomendables.' },
];

/* ── Star row helper ────────────────────────────────────────────────────── */
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
    const cls = size === 'lg' ? 'size-6' : 'size-3.5';
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`${cls} ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
        </div>
    );
}

/* ── Google-style aggregate header ─────────────────────────────────────── */
function RatingSummary() {
    return (
        <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
            {/* Big number */}
            <div className="flex flex-col items-center">
                <span className="text-6xl font-extrabold leading-none text-[#1E2D4A] dark:text-white">
                    {OVERALL_RATING}
                </span>
                <Stars rating={5} size="lg" />
                <span className="mt-1.5 text-xs text-[#1E2D4A]/50 dark:text-white/40">
                    {TOTAL_REVIEWS} reseñas en Google
                </span>
            </div>

            {/* Rating bars */}
            <div className="flex flex-col gap-1.5 min-w-[180px]">
                {[5, 4, 3, 2, 1].map((n) => {
                    const pcts: Record<number, number> = { 5: 93, 4: 5, 3: 2, 2: 0, 1: 0 };
                    return (
                        <div key={n} className="flex items-center gap-2">
                            <span className="w-2 text-xs text-[#1E2D4A]/50 dark:text-white/40">{n}</span>
                            <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                            <div className="flex-1 h-1.5 rounded-full bg-[#1E2D4A]/10 dark:bg-white/10 overflow-hidden">
                                <div className="h-full rounded-full bg-amber-400" style={{ width: `${pcts[n]}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Google badge */}
            <a
                href={CONTACT.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 rounded-2xl border border-[#1E2D4A]/10 bg-white px-6 py-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#0d1929]/60"
            >
                {/* Google "G" logo SVG */}
                <svg viewBox="0 0 24 24" className="size-8" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div>
                    <p className="text-xs font-bold text-[#1E2D4A] dark:text-white">Google Reviews</p>
                    <p className="text-xs text-[#1E2D4A]/50 dark:text-white/40">Ver todas las reseñas</p>
                </div>
                <ExternalLink className="size-3 text-[#1E2D4A]/30" />
            </a>
        </div>
    );
}

/* ── Main section ───────────────────────────────────────────────────────── */
export default function TestimonialsSection() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section className="bg-[#F7F7F5] py-20 dark:bg-[#0d1929]/50" aria-label="Testimonios de clientes">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    ref={ref}
                    className="mb-10 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <span className="mb-3 inline-block rounded-full bg-[#D9252A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">
                        Reseñas verificadas
                    </span>
                    <h2 className="text-3xl font-extrabold text-[#1E2D4A] sm:text-4xl dark:text-white">
                        Lo que dicen nuestros clientes
                    </h2>
                </motion.div>

                {/* Aggregate rating */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <RatingSummary />
                </motion.div>

                {/* Cards grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.blockquote
                            key={t.name}
                            className="flex flex-col rounded-2xl border border-[#1E2D4A]/8 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/8 dark:bg-[#0d1929]/60"
                            initial={{ opacity: 0, y: 28 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.45, delay: 0.08 * i }}
                        >
                            {/* Header: avatar + name + verified */}
                            <div className="mb-3 flex items-center gap-3">
                                <div
                                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                    style={{ background: t.color }}
                                    aria-hidden
                                >
                                    {t.initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <cite className="truncate text-sm font-bold not-italic text-[#1E2D4A] dark:text-white">
                                            {t.name}
                                        </cite>
                                        <BadgeCheck className="size-3.5 shrink-0 text-[#4285F4]" aria-label="Reseña verificada" />
                                    </div>
                                    <p className="text-xs text-[#1E2D4A]/40 dark:text-white/35">{t.date}</p>
                                </div>
                                {/* Google logo small */}
                                <svg viewBox="0 0 24 24" className="size-4 shrink-0 opacity-60" aria-hidden>
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                            </div>

                            {/* Stars + service tag */}
                            <div className="mb-3 flex items-center gap-2">
                                <Stars rating={t.rating} />
                                <span className="rounded-full bg-[#1E2D4A]/8 px-2 py-0.5 text-xs font-medium text-[#1E2D4A]/60 dark:bg-white/8 dark:text-white/50">
                                    {t.service}
                                </span>
                            </div>

                            {/* Text */}
                            <p className="flex-1 text-sm leading-relaxed text-[#1E2D4A]/70 dark:text-white/65">
                                "{t.text}"
                            </p>
                        </motion.blockquote>
                    ))}
                </div>

                {/* CTA to Google */}
                <motion.div
                    className="mt-10 text-center"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <a
                        href={CONTACT.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E2D4A]/15 px-6 py-3 text-sm font-bold text-[#1E2D4A] transition-all hover:bg-[#1E2D4A]/5 hover:-translate-y-0.5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                    >
                        <ExternalLink className="size-4" />
                        Ver todas las {TOTAL_REVIEWS} reseñas en Google
                    </a>
                </motion.div>

            </div>
        </section>
    );
}
