import { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import {
    Wrench, Zap, Gauge, Droplets, Paintbrush2,
    Target, Flame, Navigation, Car, ShieldCheck,
    ClipboardList, Wallet, PackageCheck, ChevronRight,
} from 'lucide-react';
import WelcomeNavbar from '@/components/welcome/WelcomeNavbar';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import ScrollToTopFAB from '@/components/welcome/sections/ScrollToTopFAB';
import SoraFAB from '@/components/welcome/SoraFAB';

const BREADCRUMB_LD = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio',    item: 'https://raautomotriz.com/' },
        { '@type': 'ListItem', position: 2, name: 'Servicios', item: 'https://raautomotriz.com/servicios' },
    ],
});

/* ── Data ───────────────────────────────────────────────────────────────── */
const SERVICES = [
    { icon: Wrench,      slug: 'reparacion-motores',   img: 7,  title: 'Reparación de motores',     desc: 'Diagnóstico computarizado, desmontaje, rectificación y armado completo. Trabajamos con todo tipo de motores.' },
    { icon: Car,         slug: 'suspension',            img: 4,  title: 'Suspensión',                desc: 'Cambio de amortiguadores, resortes, rotulas y bujes. Tu seguridad en cada curva.' },
    { icon: Navigation,  slug: 'direccion',             img: 13, title: 'Dirección',                 desc: 'Reparación de caja de dirección, cremallera y columna. Manejo seguro y preciso.' },
    { icon: Gauge,       slug: 'frenos',                img: 2,  title: 'Frenos',                    desc: 'Revisión y cambio de pastillas, discos, tambores, cilindros y líquido de frenos.' },
    { icon: Zap,         slug: 'sistema-electrico',     img: 16, title: 'Sistema eléctrico',         desc: 'Diagnóstico y reparación del cableado, alternador, arranque y sistema ECU.' },
    { icon: Target,      slug: 'scanner',               img: 20, title: 'Scanner automotriz',        desc: 'Lectura de códigos OBD2, reset de testigos y diagnóstico completo por computadora.' },
    { icon: Droplets,    slug: 'cambio-aceite',         img: 3,  title: 'Cambio de aceite',          desc: 'Aceite sintético o semisintético con filtro incluido. Marca recomendada para tu motor.' },
    { icon: Paintbrush2, slug: 'planchado-pintura',     img: 23, title: 'Planchado y pintura',       desc: 'Cabina profesional de pintura, igualación de color y enderezado de carrocería.' },
    { icon: Target,      slug: 'alineamiento-balanceo', img: 11, title: 'Alineamiento y balanceo',   desc: 'Alineación computarizada 3D y balanceo dinámico para mayor vida útil de tus neumáticos.' },
    { icon: Flame,       slug: 'instalacion-glp',       img: 18, title: 'Instalación de GLP',        desc: 'Conversión certificada a gas GLP. Ahorra hasta 40% en combustible con total seguridad.' },
];

const PROCESS = [
    { icon: ClipboardList, step: '01', title: 'Recepción del vehículo', desc: 'Registro de tu vehículo, revisión visual inicial y toma de datos del cliente.' },
    { icon: ShieldCheck,   step: '02', title: 'Diagnóstico preciso',    desc: 'Scanner + revisión manual por nuestros técnicos para identificar el problema.' },
    { icon: Wallet,        step: '03', title: 'Presupuesto sin sorpresas', desc: 'Te informamos antes de empezar. Sin costos ocultos ni trabajos sin autorización.' },
    { icon: PackageCheck,  step: '04', title: 'Entrega con garantía',   desc: 'Vehículo entregado en perfectas condiciones y con garantía escrita del servicio.' },
];

/* ── Components ─────────────────────────────────────────────────────────── */

function Hero() {
    return (
        <header className="relative flex min-h-[92vh] items-end overflow-hidden">
            <img src="/ra/dise%C3%B1o/5.jpeg" alt="Taller RA AUTOMOTRIZ servicios" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#0d1929]/65" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-[#FDFDFC] dark:from-[#0a0a0a] to-transparent" aria-hidden />
            <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
                <motion.span className="mb-3 inline-block rounded-full bg-[#D9252A]/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    Lo que hacemos
                </motion.span>
                <motion.h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow sm:text-5xl md:text-6xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    Nuestros <span className="text-[#D9252A]">servicios</span>
                </motion.h1>
                <motion.p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    Reparación, mantenimiento y diagnóstico profesional. Todo en un solo taller con garantía en cada trabajo.
                </motion.p>
            </div>
        </header>
    );
}

function ServicesGrid() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section className="bg-[#FDFDFC] py-20 dark:bg-[#0a0a0a]" aria-label="Lista de servicios">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div ref={ref} className="mb-14 text-center" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
                    <span className="mb-3 inline-block rounded-full bg-[#D9252A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">
                        Especialidades
                    </span>
                    <h2 className="text-3xl font-extrabold text-[#1E2D4A] sm:text-4xl dark:text-white">
                        Todo lo que tu vehículo necesita
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-[#1E2D4A]/60 dark:text-white/50">
                        Equipo certificado, repuestos de primera línea y garantía en todos los trabajos.
                    </p>
                </motion.div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {SERVICES.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.article
                                key={s.slug}
                                id={s.slug}
                                className="group scroll-mt-24 overflow-hidden rounded-2xl border border-[#1E2D4A]/8 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/8 dark:bg-[#0d1929]/60"
                                initial={{ opacity: 0, y: 32 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.45, delay: 0.05 * i }}
                            >
                                {/* Thumbnail */}
                                <div className="relative h-36 overflow-hidden">
                                    <img
                                        src={`/ra/dise%C3%B1o/${s.img}.jpeg`}
                                        alt={s.title}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-[#0d1929]/70 to-transparent" aria-hidden />
                                    <div className="absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-xl bg-[#D9252A]">
                                        <Icon className="size-4 text-white" />
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="mb-2 text-sm font-bold text-[#1E2D4A] dark:text-white">{s.title}</h3>
                                    <p className="text-xs leading-relaxed text-[#1E2D4A]/60 dark:text-white/50">{s.desc}</p>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function HowWeWork() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section className="bg-[#1E2D4A] py-20" aria-label="Cómo trabajamos">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <motion.div ref={ref} className="mb-14 text-center" initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
                    <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">El proceso</span>
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">¿Cómo trabajamos?</h2>
                    <p className="mx-auto mt-4 max-w-lg text-base text-white/60">Transparencia y profesionalismo en cada etapa de tu servicio.</p>
                </motion.div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {PROCESS.map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <motion.div
                                key={p.step}
                                className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                                initial={{ opacity: 0, y: 28 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.45, delay: 0.1 * i }}
                            >
                                {/* Connector line (not on last) */}
                                {i < PROCESS.length - 1 && (
                                    <div className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-white/20 lg:block" aria-hidden />
                                )}
                                <span className="mb-4 block text-3xl font-extrabold text-white/10">{p.step}</span>
                                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-[#D9252A]/20">
                                    <Icon className="size-5 text-[#D9252A]" />
                                </div>
                                <h3 className="mb-2 text-sm font-bold text-white">{p.title}</h3>
                                <p className="text-xs leading-relaxed text-white/60">{p.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function Cta() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });

    return (
        <section className="bg-[#F7F7F5] py-20 dark:bg-[#0d1929]/40">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55 }}>
                    <span className="mb-3 inline-block rounded-full bg-[#D9252A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">¿Necesitas ayuda?</span>
                    <h2 className="mb-5 text-3xl font-extrabold text-[#1E2D4A] sm:text-4xl dark:text-white">Lleva tu vehículo al taller</h2>
                    <p className="mb-10 text-base text-[#1E2D4A]/60 dark:text-white/50">Sin citas previas, de lunes a sábado. Atención rápida y diagnóstico honesto.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/contacto" className="inline-flex items-center gap-2 rounded-xl bg-[#D9252A] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#D9252A]/25 transition-all hover:bg-[#c21f24] hover:-translate-y-0.5">
                            Contactarnos <ChevronRight className="size-4" />
                        </Link>
                        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E2D4A]/20 px-8 py-3.5 text-sm font-bold text-[#1E2D4A] transition-all hover:bg-[#1E2D4A]/5 dark:border-white/20 dark:text-white dark:hover:bg-white/5">
                            Inicio
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function Servicios() {
    return (
        <>
            <Head title="Servicios - RA AUTOMOTRIZ | Mecánica automotriz en Chiclayo">
                <meta name="description"        content="Servicios de RA AUTOMOTRIZ: reparación de motores, frenos, suspensión, dirección, sistema eléctrico, scanner OBD2, cambio de aceite, planchado, pintura, alineamiento y GLP en Chiclayo." />
                <meta name="keywords"           content="servicios taller mecánico Chiclayo, reparación motores Chiclayo, cambio aceite Chiclayo, scanner OBD2, planchado pintura Chiclayo, alineamiento balanceo, instalación GLP Chiclayo" />
                <meta name="author"             content="RA AUTOMOTRIZ" />
                <meta name="robots"             content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="geo.region"         content="PE-LAM" />
                <meta name="geo.placename"      content="Chiclayo, Lambayeque, Perú" />
                <link rel="canonical"           href="https://raautomotriz.com/servicios" />
                <meta property="og:type"        content="website" />
                <meta property="og:url"         content="https://raautomotriz.com/servicios" />
                <meta property="og:site_name"   content="RA AUTOMOTRIZ" />
                <meta property="og:locale"      content="es_PE" />
                <meta property="og:title"       content="Servicios – RA AUTOMOTRIZ | Taller mecánico Chiclayo" />
                <meta property="og:description" content="Motor, frenos, suspensión, eléctrico, scanner OBD2, planchado, pintura, GLP y más. Todo con garantía en Chiclayo." />
                <meta property="og:image"       content="https://raautomotriz.com/ra/dise%C3%B1o/5.jpeg" />
                <meta property="og:image:alt"   content="Servicios de mecánica automotriz – RA AUTOMOTRIZ Chiclayo" />
                <meta name="twitter:card"       content="summary_large_image" />
                <meta name="twitter:site"       content="@raautomotriz" />
                <meta name="twitter:title"      content="Servicios – RA AUTOMOTRIZ | Chiclayo" />
                <meta name="twitter:description" content="10 especialidades: motor, frenos, scanner OBD2, planchado, GLP y más. Garantía en cada trabajo." />
                <meta name="twitter:image"      content="https://raautomotriz.com/ra/dise%C3%B1o/5.jpeg" />
                <link rel="preload"             href="/ra/dise%C3%B1o/5.jpeg" as="image" type="image/jpeg" fetchPriority="high" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: BREADCRUMB_LD }} />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                <WelcomeNavbar />
                <main id="main-content">
                    <Hero />
                    <ServicesGrid />
                    <HowWeWork />
                    <Cta />
                </main>
                <WelcomeFooter />
            </div>
            <SoraFAB />
            <ScrollToTopFAB />
        </>
    );
}
