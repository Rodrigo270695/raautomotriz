import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AwardIcon,
    ClockIcon,
    EyeIcon,
    FlagIcon,
    HeartIcon,
    ShieldIcon,
    WrenchIcon,
} from './icons-sobre-nosotros';
import RAHeroLetters from './RAHeroLetters';

const MISION_VISION_VALORES = [
    {
        title: 'Misión',
        description:
            'Ofrecer servicios de mecánica automotriz de la más alta calidad, con honestidad y trato cercano, para que tu vehículo recupere su rendimiento y tú tengas tranquilidad en cada kilómetro.',
        icon: FlagIcon,
    },
    {
        title: 'Visión',
        description:
            'Ser el taller de referencia en la zona, reconocido por nuestra profesionalidad, equipamiento actualizado y un equipo comprometido con la seguridad y satisfacción de cada cliente.',
        icon: EyeIcon,
    },
    {
        title: 'Nuestros valores',
        description:
            'Trabajo bien hecho, transparencia en presupuestos, uso de repuestos de calidad y un trato humano. Tu confianza es nuestra mejor carta de presentación.',
        icon: HeartIcon,
    },
] as const;

const POR_QUE_ELEGIRNOS = [
    {
        title: 'Experiencia y dedicación',
        text: 'Años de trayectoria y formación continua para ofrecerte el mejor diagnóstico y reparación.',
        icon: WrenchIcon,
    },
    {
        title: 'Transparencia total',
        text: 'Presupuestos claros, sin sorpresas. Te explicamos cada detalle antes de actuar.',
        icon: ShieldIcon,
    },
    {
        title: 'Atención cercana',
        text: 'Personas técnicas con trato humano. Aquí no eres un número, eres parte de la familia.',
        icon: HeartIcon,
    },
    {
        title: 'Compromiso con tu tiempo',
        text: 'Respetamos tus plazos y te mantenemos informado en cada paso del servicio.',
        icon: ClockIcon,
    },
] as const;

const STATS = [
    { value: '+10', label: 'Años de experiencia' },
    { value: '100%', label: 'Compromiso con tu seguridad' },
    { value: '∞', label: 'Clientes que confían' },
] as const;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: i * 0.05 },
    }),
};

const itemVariants = {
    hidden: { y: 32, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

export default function SobreNosotrosSection() {
    return (
        <article id="sobre-nosotros" className="relative overflow-hidden">
            {/* Hero Sobre nosotros — con alma: gradiente, patrón sutil, luz central y acento rojo */}
            <section
                className="relative overflow-hidden border-b border-[#1E2D4A]/15 dark:border-white/10"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 85% 70% at 50% 45%, rgba(255,255,255,0.18) 0%, transparent 55%),
                        radial-gradient(circle at 88% 12%, rgba(217,37,42,0.08) 0%, transparent 38%),
                        radial-gradient(circle at 12% 88%, rgba(217,37,42,0.05) 0%, transparent 30%),
                        radial-gradient(circle, rgba(30,45,74,0.2) 1.5px, transparent 1.5px),
                        linear-gradient(180deg, rgba(30,45,74,0.48) 0%, rgba(30,45,74,0.28) 50%, rgba(30,45,74,0.14) 100%)
                    `,
                    backgroundSize: '100% 100%, 100% 100%, 100% 100%, 26px 26px, 100% 100%',
                }}
            >
                {/* Formas decorativas en el hero */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                    <motion.div
                        className="absolute -left-20 -top-20 h-64 w-64 rounded-full border border-[#D9252A]/10"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    />
                    <motion.div
                        className="absolute -right-16 top-1/4 h-40 w-40 rounded-full bg-[#1E2D4A]/5"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: 0.7 }}
                    />
                    <motion.div
                        className="absolute bottom-20 left-1/4 h-2 w-2 rounded-full bg-[#D9252A]/20"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                    />
                    <motion.div
                        className="absolute right-1/3 top-32 h-1 w-1 rounded-full bg-[#1E2D4A]/20"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.4, type: 'spring', stiffness: 200 }}
                    />
                </div>
                <RAHeroLetters />
            </section>

            {/* Divisor decorativo */}
            <div className="relative z-10 flex justify-center py-6" aria-hidden>
                <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <span className="h-px w-12 bg-linear-to-r from-transparent to-[#1E2D4A]/20" />
                    <span className="h-2 w-2 rotate-45 bg-[#D9252A]/40" />
                    <span className="h-px w-8 bg-[#1E2D4A]/20" />
                    <span className="h-2 w-2 rotate-45 bg-[#D9252A]/40" />
                    <span className="h-px w-12 bg-linear-to-l from-transparent to-[#1E2D4A]/20" />
                </motion.div>
            </div>

            {/* Intro breve — con marco, etiqueta y efecto en la frase */}
            <motion.section
                className="relative z-10 px-4 py-14 sm:px-6 md:py-20"
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            >
                <div className="relative mx-auto max-w-3xl">
                    <motion.div
                        className="absolute left-1/2 top-0 h-px -translate-x-1/2 bg-[#D9252A]/60"
                        initial={{ width: 0 }}
                        whileInView={{ width: 48 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        aria-hidden
                    />
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#D9252A]">
                        Quiénes somos
                    </p>
                    <p className="mt-6 text-center text-lg leading-relaxed text-[#1E2D4A]/85 dark:text-white/80 md:text-xl">
                        En RA AUTOMOTRIZ no solo reparamos autos: <motion.span className="inline-block font-medium text-[#1E2D4A] dark:text-white" whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>cuidamos lo que te lleva a diario</motion.span>. Somos un equipo con vocación, herramientas actualizadas y el compromiso de darte tranquilidad en cada kilómetro.
                    </p>
                    <motion.div className="mx-auto mt-8 flex justify-center gap-2" aria-hidden>
                        <motion.span className="h-1.5 w-1.5 rounded-full bg-[#1E2D4A]/30 dark:bg-white/30" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }} />
                        <motion.span className="h-1.5 w-1.5 rounded-full bg-[#D9252A]/60" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }} whileHover={{ scale: 1.5 }} />
                        <motion.span className="h-1.5 w-1.5 rounded-full bg-[#1E2D4A]/30 dark:bg-white/30" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }} />
                    </motion.div>
                </div>
            </motion.section>

            {/* Frase destacada — con comillas animadas */}
            <motion.section
                className="relative z-10 px-4 py-8 sm:px-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ type: 'spring', stiffness: 70, damping: 22 }}
            >
                <motion.div
                    className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#1E2D4A]/10 bg-[#1E2D4A]/5 px-6 py-8 transition-colors hover:border-[#D9252A]/25 dark:border-white/10 dark:bg-white/5 dark:hover:border-[#D9252A]/30"
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ boxShadow: '0 8px 32px -8px rgba(30,45,74,0.12)' }}
                >
                    {/* Esquina decorativa */}
                    <div className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-[#D9252A]/20 rounded-tr-2xl" aria-hidden />
                    <motion.span
                        className="absolute left-4 top-4 text-3xl font-serif italic leading-none text-[#D9252A]/25 dark:text-[#f87171]/25"
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        aria-hidden
                    >
                        "
                    </motion.span>
                    <p className="relative text-center text-xl font-medium italic text-[#1E2D4A]/85 dark:text-white/85 md:text-2xl">
                        Cada kilómetro cuenta. Nosotros nos encargamos de que sea seguro.
                    </p>
                    <motion.span
                        className="absolute bottom-4 right-4 text-3xl font-serif italic leading-none text-[#D9252A]/25 dark:text-[#f87171]/25"
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        aria-hidden
                    >
                        "
                    </motion.span>
                </motion.div>
            </motion.section>

            {/* Franja de números — barra con efecto hover y animación de entrada */}
            <motion.section
                className="relative z-10 py-14 md:py-20"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: 'spring', stiffness: 60, damping: 22 }}
            >
                <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
                    <div className="absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-[#D9252A]/50 to-transparent sm:inset-x-6" aria-hidden />
                    <motion.div
                        className="relative grid grid-cols-1 gap-12 overflow-hidden rounded-2xl bg-[#1E2D4A] px-8 py-16 text-center shadow-xl md:grid-cols-3 md:gap-0 md:py-20"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 60, damping: 22 }}
                        whileHover={{ boxShadow: '0 25px 50px -12px rgba(30, 45, 74, 0.4)' }}
                    >
                        {/* Brillo superior */}
                        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-b from-white/20 to-transparent" aria-hidden />
                        {/* Esquina inferior roja */}
                        <div className="absolute bottom-0 right-0 h-12 w-12 border-b-2 border-l-2 border-[#D9252A]/30 rounded-bl-2xl" aria-hidden />
                        {STATS.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="relative md:border-r md:border-white/15 last:md:border-r-0"
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, type: 'spring', stiffness: 80, damping: 20 }}
                                whileHover={{ scale: 1.03 }}
                            >
                                <motion.span
                                    className="block text-4xl font-extrabold tracking-tight text-[#D9252A] md:text-5xl"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {stat.value}
                                </motion.span>
                                <span className="mt-2 block text-sm font-medium text-white/80 md:text-base">
                                    {stat.label}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                    <div className="absolute bottom-0 inset-x-4 h-px bg-linear-to-r from-transparent via-white/20 to-transparent sm:inset-x-6" aria-hidden />
                </div>
            </motion.section>

            {/* Divisor antes de Pilares */}
            <div className="relative z-10 flex justify-center py-8" aria-hidden>
                <motion.div className="flex items-center gap-3" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                    <span className="h-px w-16 bg-[#1E2D4A]/15 dark:bg-white/15" />
                    <span className="h-1 w-1 rounded-full bg-[#D9252A]/40" />
                    <span className="h-px w-6 bg-[#1E2D4A]/10 dark:bg-white/10" />
                    <span className="h-1 w-1 rounded-full bg-[#D9252A]/40" />
                    <span className="h-px w-16 bg-[#1E2D4A]/15 dark:bg-white/15" />
                </motion.div>
            </div>

            {/* Lo que nos guía — con etiqueta, numeración sutil y separadores */}
            <section
                className="relative z-10 py-16 md:py-24 lg:py-28"
                aria-labelledby="mision-vision-valores"
                style={{
                    backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(30,45,74,0.04) 0%, transparent 50%)',
                }}
            >
                {/* Marco decorativo sutil */}
                <div className="absolute left-4 top-1/4 h-24 w-px bg-linear-to-b from-transparent via-[#D9252A]/15 to-transparent md:left-8" aria-hidden />
                <div className="absolute right-4 top-1/3 h-32 w-px bg-linear-to-b from-transparent via-[#1E2D4A]/10 to-transparent md:right-8" aria-hidden />
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <motion.p
                        className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#D9252A]"
                        initial={{ y: 16, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Pilares
                    </motion.p>
                    <motion.h2
                        id="mision-vision-valores"
                        className="mb-16 text-center text-2xl font-bold text-[#1E2D4A] dark:text-white md:mb-20 md:text-3xl"
                        initial={{ y: 24, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 70, damping: 20 }}
                    >
                        Lo que nos guía cada día
                    </motion.h2>

                    {[0, 1, 2].map((index) => {
                        const item = MISION_VISION_VALORES[index];
                        const labels = ['Misión', 'Visión', 'Nuestros valores'];
                        return (
                            <motion.article
                                key={item.title}
                                className={`relative ${index < 2 ? 'pb-20 md:pb-28' : ''}`}
                                initial={{ y: 40, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ type: 'spring', stiffness: 60, damping: 22 }}
                                whileHover={{ x: 6 }}
                            >
                                {index > 0 && (
                                    <div className="absolute left-8 top-0 h-px w-16 bg-[#1E2D4A]/15 dark:bg-white/15 md:left-14" aria-hidden />
                                )}
                                <div className="flex flex-col md:flex-row md:gap-14">
                                    <div className="flex shrink-0 items-start gap-4 md:w-24 md:flex-col md:gap-2">
                                        <motion.span
                                            className="text-2xl font-extrabold tabular-nums text-[#1E2D4A]/12 dark:text-white/15"
                                            whileHover={{ opacity: 0.25 }}
                                            transition={{ duration: 0.2 }}
                                            aria-hidden
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                        </motion.span>
                                        <div className="w-px self-stretch bg-[#D9252A]/80 md:h-12 md:w-full md:max-w-px" aria-hidden />
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1">
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D9252A]">
                                            {labels[index]}
                                        </p>
                                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#1E2D4A]/90 dark:text-white/90 md:text-lg">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </section>

            {/* Divisor antes de Por qué confiar */}
            <motion.div
                className="relative z-10 flex justify-center py-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                aria-hidden
            >
                <div className="flex items-center gap-4">
                    <span className="h-px w-20 bg-linear-to-r from-transparent to-[#D9252A]/20" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9252A]/30" />
                    <span className="h-px w-8 bg-[#1E2D4A]/15 dark:bg-white/15" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D9252A]/30" />
                    <span className="h-px w-20 bg-linear-to-l from-transparent to-[#D9252A]/20" />
                </div>
            </motion.div>

            {/* Por qué confiar — fondo con patrón sutil, iconos en círculo */}
            <section
                className="relative z-10 overflow-hidden py-16 md:py-24 lg:py-28"
                aria-labelledby="por-que-elegirnos"
                style={{
                    backgroundColor: 'rgba(30, 45, 74, 0.04)',
                    backgroundImage: 'radial-gradient(circle, rgba(30,45,74,0.08) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            >
                {/* Banda diagonal decorativa muy sutil */}
                <div className="absolute -right-40 top-0 h-full w-80 rotate-12 bg-linear-to-l from-[#D9252A]/5 to-transparent" aria-hidden />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#1E2D4A]/5 dark:to-white/5" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.p
                        className="mb-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#D9252A]"
                        initial={{ y: 16, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Tu tranquilidad es nuestra prioridad
                    </motion.p>
                    <motion.h2
                        id="por-que-elegirnos"
                        className="mb-4 text-center text-2xl font-bold text-[#1E2D4A] dark:text-white md:mb-6 md:text-3xl"
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                    >
                        Por qué confiar en nosotros
                    </motion.h2>
                    <motion.p
                        className="mx-auto max-w-2xl text-center text-[#1E2D4A]/80 dark:text-white/70"
                        initial={{ y: 16, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Porque creemos que un taller no es solo un lugar donde arreglan tu auto: es donde te devuelven la confianza para seguir adelante.
                    </motion.p>

                    <motion.div
                        className="mt-16 grid grid-cols-1 gap-14 sm:grid-cols-2 lg:mt-20 lg:gap-x-20 lg:gap-y-16"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.08 }}
                        custom={0}
                    >
                        {POR_QUE_ELEGIRNOS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.title}
                                    variants={itemVariants}
                                    className="group flex flex-col border-l-2 border-transparent pl-6 transition-[border-color] duration-300 hover:border-[#D9252A]/30 md:pl-0"
                                    whileHover={{ y: -6, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
                                >
                                    <motion.div
                                        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-[#D9252A] dark:text-[#f87171]"
                                        style={{ backgroundColor: 'rgba(217,37,42,0.1)' }}
                                        initial={{ backgroundColor: 'rgba(217,37,42,0.1)' }}
                                        aria-hidden
                                        whileHover={{ scale: 1.08, rotate: 5, backgroundColor: 'rgba(217,37,42,0.18)' }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    >
                                        <Icon className="h-7 w-7" />
                                    </motion.div>
                                    <h3 className="mb-2 text-lg font-semibold text-[#1E2D4A] dark:text-white">
                                        {item.title}
                                    </h3>
                                    <p className="max-w-md text-sm leading-relaxed text-[#1E2D4A]/80 dark:text-white/75">
                                        {item.text}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* CTA final — fondo suave, formas flotantes y botones destacados */}
            <motion.section
                className="relative z-10 overflow-hidden py-20 md:py-28 lg:py-32"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: 'spring', stiffness: 60, damping: 22 }}
                style={{
                    backgroundImage: 'linear-gradient(180deg, rgba(30,45,74,0.06) 0%, transparent 40%, rgba(217,37,42,0.03) 100%)',
                }}
            >
                {/* Formas de fondo */}
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                    <motion.div
                        className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full border border-[#1E2D4A]/10"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/5 h-24 w-24 rounded-full bg-[#D9252A]/5"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    />
                    <motion.div
                        className="absolute right-1/3 bottom-1/3 h-2 w-2 rounded-full bg-[#D9252A]/20"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                    />
                </div>
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#D9252A]/30 to-transparent" aria-hidden />
                <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
                    <motion.div
                        className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D9252A]/10 dark:bg-[#D9252A]/20"
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                        {/* Anillo decorativo detrás del icono */}
                        <span className="absolute inset-0 rounded-2xl ring-2 ring-[#D9252A]/20 ring-offset-4 ring-offset-transparent dark:ring-offset-[#0a0a0a]" aria-hidden />
                        <AwardIcon className="relative h-9 w-9 text-[#D9252A] dark:text-[#f87171]" aria-hidden />
                    </motion.div>
                    <motion.p
                        className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D9252A] mb-2"
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                    >
                        Tu próximo paso
                    </motion.p>
                    <p className="text-xl font-medium leading-relaxed text-[#1E2D4A] dark:text-white md:text-2xl">
                        Tu confianza es nuestra mejor carta de presentación. Te esperamos para conocerte y cuidar tu vehículo como se merece.
                    </p>
                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/servicios"
                                className="inline-flex items-center rounded-xl bg-[#D9252A] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#D9252A]/20 transition-colors hover:bg-[#c21f24] hover:shadow-xl hover:shadow-[#D9252A]/25 focus:outline-none focus:ring-2 focus:ring-[#D9252A]/50 focus:ring-offset-2"
                            >
                                Ver nuestros servicios
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href="/contacto"
                                className="inline-flex items-center rounded-xl border-2 border-[#1E2D4A]/20 bg-white px-6 py-3.5 text-sm font-semibold text-[#1E2D4A] transition-colors hover:bg-[#1E2D4A]/5 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                            >
                                Contactar
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.section>
        </article>
    );
}
