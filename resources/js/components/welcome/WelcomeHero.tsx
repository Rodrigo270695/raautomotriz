import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

// 23 imágenes del taller (carpeta public/ra/diseño/)
const IMG_BASE = '/ra/dise%C3%B1o/';
const IMAGES = Array.from({ length: 23 }, (_, i) => `${IMG_BASE}${i + 1}.jpeg`);

const SLIDES = [
    { headline: 'Expertos en tu vehículo',    sub: 'Diagnóstico profesional con tecnología de última generación.' },
    { headline: 'Reparación garantizada',      sub: 'Cada trabajo con repuestos de calidad y garantía escrita.' },
    { headline: 'Más de 500 clientes confían', sub: 'Somos el taller de referencia en Chiclayo desde hace años.' },
    { headline: 'Tecnología + Experiencia',    sub: 'Scanner automotriz, planchado, pintura y mucho más.' },
];

export default function WelcomeHero() {
    const [current, setCurrent]   = useState(0);
    const [animKey, setAnimKey]   = useState(0);
    const [paused, setPaused]     = useState(false);
    const total = IMAGES.length;

    const next = useCallback(() => {
        setCurrent((c) => (c + 1) % total);
        setAnimKey((k) => k + 1);
    }, [total]);

    const prev = useCallback(() => {
        setCurrent((c) => (c - 1 + total) % total);
        setAnimKey((k) => k + 1);
    }, [total]);

    useEffect(() => {
        if (paused) return;
        const t = setInterval(next, 5500);
        return () => clearInterval(t);
    }, [paused, next]);

    const slideData = SLIDES[current % SLIDES.length];

    return (
        <section
            className="relative h-screen min-h-[600px] w-full overflow-hidden"
            aria-label="Hero RA AUTOMOTRIZ"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* ── Imágenes con Ken Burns ──────────────────────────────── */}
            {IMAGES.map((src, i) => (
                <div
                    key={src}
                    className="absolute inset-0 transition-opacity duration-1000"
                    style={{ opacity: i === current ? 1 : 0 }}
                    aria-hidden={i !== current}
                >
                    <div
                        key={i === current ? animKey : undefined}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${src})`,
                            animation: i === current ? 'kenburns 6s ease-in-out forwards' : 'none',
                        }}
                    />
                </div>
            ))}

            {/* ── Overlays ────────────────────────────────────────────── */}
            {/* Capa oscura base */}
            <div className="absolute inset-0 bg-[#0d1929]/55" aria-hidden />
            {/* Gradiente inferior para transición suave a la página */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#FDFDFC] dark:from-[#0a0a0a] to-transparent" aria-hidden />
            {/* Gradiente lateral izquierdo */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-[#0d1929]/40 to-transparent" aria-hidden />

            {/* ── Contenido central ───────────────────────────────────── */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-20 pt-24 sm:px-6 lg:px-8">

                {/* Logo animado */}
                <motion.img
                    src="/logorasf.png"
                    alt="RA AUTOMOTRIZ"
                    className="mb-8 h-20 w-auto object-contain drop-shadow-2xl sm:h-24 md:h-28 filter brightness-0 invert"
                    initial={{ scale: 0.85, opacity: 0, y: -20 }}
                    animate={{ scale: 1,    opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 70, damping: 16, delay: 0.2 }}
                />

                {/* Headline dinámico */}
                <AnimatePresence mode="wait">
                    <motion.h1
                        key={`h-${current}`}
                        className="mb-4 max-w-3xl text-center text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl"
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0,  opacity: 1 }}
                        exit={{ y: -16, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {slideData.headline}
                    </motion.h1>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={`p-${current}`}
                        className="mb-10 max-w-xl text-center text-base leading-relaxed text-white/85 drop-shadow sm:text-lg"
                        initial={{ y: 16, opacity: 0 }}
                        animate={{ y: 0,  opacity: 1 }}
                        exit={{ y: -12, opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {slideData.sub}
                    </motion.p>
                </AnimatePresence>

                {/* CTAs */}
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                >
                    <Link
                        href="/servicios"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#D9252A] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#D9252A]/30 transition-all hover:bg-[#c21f24] hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#D9252A]/60 focus:ring-offset-2 focus:ring-offset-transparent"
                    >
                        Ver servicios
                    </Link>
                    <Link
                        href="/contacto"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5"
                    >
                        Contáctanos
                    </Link>
                    <a
                        href="#sora"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all hover:bg-white/15 hover:-translate-y-0.5"
                    >
                        <MessageCircle className="size-4" />
                        Consultar con IA
                    </a>
                </motion.div>
            </div>

            {/* ── Controles del slider ──────────────────────────────── */}
            <button
                type="button"
                onClick={prev}
                aria-label="Imagen anterior"
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/40 hover:text-white hover:scale-110 focus:outline-none sm:left-6"
            >
                <ChevronLeft className="size-5" />
            </button>
            <button
                type="button"
                onClick={next}
                aria-label="Siguiente imagen"
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/40 hover:text-white hover:scale-110 focus:outline-none sm:right-6"
            >
                <ChevronRight className="size-5" />
            </button>

            {/* ── Dots indicator ───────────────────────────────────── */}
            <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-1.5" role="tablist" aria-label="Imágenes del slider">
                {IMAGES.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={i === current}
                        aria-label={`Imagen ${i + 1}`}
                        onClick={() => { setCurrent(i); setAnimKey((k) => k + 1); }}
                        className={`rounded-full transition-all duration-300 ${
                            i === current
                                ? 'w-6 h-1.5 bg-white'
                                : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                    />
                ))}
            </div>

            {/* ── Progress bar ─────────────────────────────────────── */}
            {!paused && (
                <div
                    key={`bar-${animKey}`}
                    className="absolute bottom-0 left-0 z-20 h-0.5 bg-[#D9252A]/70"
                    style={{ animation: 'progress 5.5s linear forwards' }}
                />
            )}

            {/* ── Scroll indicator ─────────────────────────────────── */}
            <motion.div
                className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50"
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                aria-hidden
            >
                <ChevronDown className="size-5" />
            </motion.div>
        </section>
    );
}
