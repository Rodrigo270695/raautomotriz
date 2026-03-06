import { useRef, useState, type FormEvent } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Phone, MessageCircle, ChevronRight, Navigation, Send, User, Wrench, CheckCircle2, ChevronDown } from 'lucide-react';
import WelcomeNavbar from '@/components/welcome/WelcomeNavbar';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import ScrollToTopFAB from '@/components/welcome/sections/ScrollToTopFAB';
import SoraFAB from '@/components/welcome/SoraFAB';
import { CONTACT } from '@/data/contact';
import { SERVICES } from '@/data/services';

const BREADCRUMB_LD = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio',   item: 'https://raautomotriz.com/' },
        { '@type': 'ListItem', position: 2, name: 'Contacto', item: 'https://raautomotriz.com/contacto' },
    ],
});

/* ── Components ─────────────────────────────────────────────────────────── */

function Hero() {
    return (
        <header className="relative flex min-h-[92vh] items-end overflow-hidden">
            <img src="/ra/dise%C3%B1o/21.jpeg" alt="RA AUTOMOTRIZ ubicación" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#0d1929]/65" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-[#FDFDFC] dark:from-[#0a0a0a] to-transparent" aria-hidden />
            <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
                <motion.span className="mb-3 inline-block rounded-full bg-[#D9252A]/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    Encuéntranos
                </motion.span>
                <motion.h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow sm:text-5xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    Estamos en <span className="text-[#D9252A]">Chiclayo</span>
                </motion.h1>
                <motion.p className="mt-4 max-w-lg text-base leading-relaxed text-white/80" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    Visítanos sin cita previa o escríbenos. Nuestro equipo está listo para atenderte.
                </motion.p>
            </div>
        </header>
    );
}

function InfoCards() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });

    const cards = [
        {
            icon: MapPin,
            title: 'Dirección',
            content: CONTACT.address,
            action: { label: 'Ver en mapa', href: CONTACT.googleMapsUrl, external: true },
            color: '#D9252A',
        },
        {
            icon: Clock,
            title: 'Horario de atención',
            content: 'Lunes a Sábado\n08:30 am – 06:30 pm',
            action: null,
            color: '#1E2D4A',
        },
        {
            icon: Phone,
            title: 'Teléfono / WhatsApp',
            content: CONTACT.phone ?? 'Contáctanos por WhatsApp',
            action: {
                label: 'Enviar mensaje',
                href: 'https://wa.me/51999999999?text=Hola%20RA%20AUTOMOTRIZ%2C%20necesito%20informaci%C3%B3n',
                external: true,
            },
            color: '#25d366',
        },
    ];

    return (
        <section className="bg-[#FDFDFC] py-16 dark:bg-[#0a0a0a]" aria-label="Información de contacto">
            <div ref={ref} className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-5 sm:grid-cols-3">
                    {cards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.title}
                                className="flex flex-col rounded-2xl border border-[#1E2D4A]/8 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/8 dark:bg-[#0d1929]/60"
                                initial={{ opacity: 0, y: 28 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.45, delay: 0.1 * i }}
                            >
                                <div className="mb-4 flex size-12 items-center justify-center rounded-xl" style={{ background: `${card.color}18` }}>
                                    <Icon className="size-6" style={{ color: card.color }} />
                                </div>
                                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#1E2D4A]/50 dark:text-white/40">{card.title}</h2>
                                <p className="flex-1 whitespace-pre-line text-sm font-medium leading-relaxed text-[#1E2D4A] dark:text-white">
                                    {card.content}
                                </p>
                                {card.action && (
                                    <a
                                        href={card.action.href}
                                        {...(card.action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                        className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#D9252A] transition-colors hover:underline underline-offset-4"
                                    >
                                        {card.action.label} <ChevronRight className="size-3.5" />
                                    </a>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

const MAX_MSG = 400;

function ContactForm() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });

    const [name,    setName]    = useState('');
    const [phone,   setPhone]   = useState('');
    const [service, setService] = useState('');
    const [message, setMessage] = useState('');
    const [sent,    setSent]    = useState(false);

    const canSubmit = name.trim() && phone.trim() && message.trim();
    const msgChars  = message.length;
    const charsLeft = MAX_MSG - msgChars;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        const svc  = service ? `\nServicio: ${service}` : '';
        const text = `Hola RA AUTOMOTRIZ 👋, soy ${name}.${svc}\n\n${message}\n\n📞 Mi teléfono: ${phone}`;
        window.open(
            `https://wa.me/51999999999?text=${encodeURIComponent(text)}`,
            '_blank',
            'noopener,noreferrer',
        );
        setSent(true);
        setTimeout(() => setSent(false), 5000);
    }

    const inputBase =
        'w-full rounded-xl border border-[#1E2D4A]/15 bg-white px-4 py-3 text-sm text-[#1E2D4A] placeholder-[#1E2D4A]/35 outline-none ring-0 transition-all duration-200 focus:border-[#D9252A]/50 focus:ring-2 focus:ring-[#D9252A]/12 dark:border-white/15 dark:bg-[#0d1929]/60 dark:text-white dark:placeholder-white/30 dark:focus:border-[#D9252A]/50';

    return (
        <section className="bg-[#F7F7F5] py-20 dark:bg-[#0d1929]/30" aria-label="Formulario de contacto">
            <div ref={ref} className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-start">

                    {/* ── Left: copy ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -28 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.55 }}
                    >
                        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.22em] text-[#D9252A]">
                            Escríbenos
                        </span>
                        <h2 className="mb-4 text-3xl font-extrabold leading-tight text-[#1E2D4A] sm:text-4xl dark:text-white">
                            ¿En qué te podemos<br />
                            <span className="text-[#D9252A]">ayudar hoy?</span>
                        </h2>
                        <p className="mb-8 text-base leading-relaxed text-[#1E2D4A]/60 dark:text-white/50">
                            Completa el formulario y te contactamos por WhatsApp en minutos. Sin filas, sin esperas.
                        </p>

                        <div className="flex flex-col gap-4">
                            {[
                                { icon: '⚡', text: 'Respuesta en menos de 30 minutos' },
                                { icon: '🔧', text: 'Diagnóstico inicial sin costo' },
                                { icon: '✅', text: 'Presupuesto sin compromiso' },
                                { icon: '🔒', text: 'Tus datos no se almacenan' },
                            ].map((b) => (
                                <div key={b.text} className="flex items-center gap-3">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-base shadow-sm dark:bg-white/10">{b.icon}</span>
                                    <span className="text-sm font-medium text-[#1E2D4A]/70 dark:text-white/60">{b.text}</span>
                                </div>
                            ))}
                        </div>

                        <a
                            href="https://wa.me/51999999999?text=Hola%20RA%20AUTOMOTRIZ%2C%20necesito%20informaci%C3%B3n"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-10 inline-flex items-center gap-2.5 rounded-xl bg-[#25d366] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#25d366]/25 transition-all hover:bg-[#1fb85a] hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            <svg viewBox="0 0 32 32" className="size-5 fill-white" aria-hidden>
                                <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.66 4.86 1.9 6.97L2 30l7.27-1.88A13.9 13.9 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.32-.59-6.18-1.71l-.44-.26-4.58 1.18 1.21-4.46-.29-.46A11.47 11.47 0 0 1 4.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.29-8.59c-.34-.17-2.03-1-2.35-1.12-.31-.11-.54-.17-.77.17-.23.34-.88 1.12-1.08 1.35-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.75-1.7-1.02-.9-1.7-2.02-1.9-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.05-2.55-.28-.67-.56-.58-.77-.59h-.66c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.03-.83 2.32-1.63.29-.8.29-1.49.2-1.63-.09-.14-.31-.23-.66-.4z"/>
                            </svg>
                            Chatear directamente
                        </a>
                    </motion.div>

                    {/* ── Right: form ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 28 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="relative"
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="relative overflow-hidden rounded-3xl border border-[#1E2D4A]/8 bg-white p-8 shadow-xl dark:border-white/8 dark:bg-[#0d1929]/60"
                            noValidate
                            aria-label="Formulario de contacto"
                        >
                            {/* ── Success overlay ── */}
                            <AnimatePresence>
                                {sent && (
                                    <motion.div
                                        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-3xl bg-white px-8 text-center dark:bg-[#0d1929]"
                                        initial={{ opacity: 0, scale: 0.92 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.92 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                                            className="flex size-20 items-center justify-center rounded-full bg-[#25d366]/15"
                                        >
                                            <CheckCircle2 className="size-10 text-[#25d366]" />
                                        </motion.div>
                                        <h3 className="text-xl font-extrabold text-[#1E2D4A] dark:text-white">¡Mensaje enviado!</h3>
                                        <p className="text-sm text-[#1E2D4A]/60 dark:text-white/50">
                                            Se abrió WhatsApp con tu consulta lista.<br />Te responderemos en minutos.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setSent(false)}
                                            className="mt-2 rounded-xl border border-[#1E2D4A]/15 px-5 py-2 text-xs font-bold text-[#1E2D4A] transition-colors hover:bg-[#1E2D4A]/5 dark:border-white/15 dark:text-white"
                                        >
                                            Enviar otro mensaje
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Nombre + Teléfono */}
                            <div className="mb-5 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="cf-name" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E2D4A]/55 dark:text-white/50">
                                        <User className="size-3.5" /> Nombre *
                                    </label>
                                    <input
                                        id="cf-name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        placeholder="Tu nombre completo"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={inputBase}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cf-phone" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E2D4A]/55 dark:text-white/50">
                                        <Phone className="size-3.5" /> Teléfono *
                                    </label>
                                    <input
                                        id="cf-phone"
                                        type="tel"
                                        required
                                        autoComplete="tel"
                                        placeholder="999 999 999"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className={inputBase}
                                    />
                                </div>
                            </div>

                            {/* Servicio — custom select con flecha */}
                            <div className="mb-5">
                                <label htmlFor="cf-service" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E2D4A]/55 dark:text-white/50">
                                    <Wrench className="size-3.5" /> Servicio de interés
                                </label>
                                <div className="relative">
                                    <select
                                        id="cf-service"
                                        value={service}
                                        onChange={(e) => setService(e.target.value)}
                                        className={`${inputBase} cursor-pointer appearance-none pr-10`}
                                    >
                                        <option value="">— Selecciona un servicio —</option>
                                        {SERVICES.map((s) => (
                                            <option key={s.slug} value={s.label}>{s.label}</option>
                                        ))}
                                        <option value="Otro">Otro / No sé aún</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#1E2D4A]/40 dark:text-white/30" />
                                </div>
                            </div>

                            {/* Mensaje + contador */}
                            <div className="mb-6">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label htmlFor="cf-message" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E2D4A]/55 dark:text-white/50">
                                        <MessageCircle className="size-3.5" /> Mensaje *
                                    </label>
                                    <span className={`text-xs tabular-nums transition-colors ${charsLeft < 50 ? 'text-[#D9252A]' : 'text-[#1E2D4A]/30 dark:text-white/25'}`}>
                                        {msgChars}/{MAX_MSG}
                                    </span>
                                </div>
                                <textarea
                                    id="cf-message"
                                    required
                                    rows={4}
                                    maxLength={MAX_MSG}
                                    placeholder="Cuéntanos el problema de tu vehículo o el servicio que necesitas…"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className={`${inputBase} resize-none`}
                                />
                            </div>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={!canSubmit}
                                whileTap={canSubmit ? { scale: 0.97 } : {}}
                                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#D9252A] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#D9252A]/20 transition-all hover:bg-[#c21f24] hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                <Send className="size-4" />
                                Enviar consulta por WhatsApp
                            </motion.button>

                            <p className="mt-4 text-center text-xs text-[#1E2D4A]/35 dark:text-white/25">
                                * Campos obligatorios · Al enviar, se abrirá WhatsApp con tu mensaje listo.
                            </p>
                        </form>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}

function MapSection() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });

    return (
        <section className="bg-[#FDFDFC] dark:bg-[#0a0a0a]" aria-label="Ubicación en el mapa">
            <div className="mx-auto max-w-7xl px-4 pb-0 pt-14 sm:px-6 lg:px-8">
                <motion.div ref={ref} className="mb-8" initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">Encuéntranos</span>
                            <h2 className="text-2xl font-extrabold text-[#1E2D4A] dark:text-white">Cómo llegar</h2>
                        </div>
                        <a
                            href={CONTACT.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E2D4A]/15 px-5 py-2.5 text-sm font-bold text-[#1E2D4A] transition-all hover:bg-[#1E2D4A]/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                        >
                            <Navigation className="size-4" /> Abrir en Google Maps
                        </a>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-[#1E2D4A]/60 dark:text-white/50">
                        <MapPin className="size-4 shrink-0 text-[#D9252A]" />
                        {CONTACT.address}
                    </p>
                </motion.div>
            </div>

            {/* Full-width map */}
            <div className="overflow-hidden border-t border-[#1E2D4A]/10 dark:border-white/10">
                <iframe
                    src={CONTACT.mapEmbedUrl}
                    width="100%"
                    height="460"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de RA AUTOMOTRIZ en Chiclayo"
                    className="block w-full grayscale-20"
                />
            </div>
        </section>
    );
}

function QuickNav() {
    return (
        <div className="bg-[#1E2D4A] py-8">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4">
                <Link href="/"          className="text-sm font-medium text-white/60 transition-colors hover:text-white">Inicio</Link>
                <span className="text-white/20">·</span>
                <Link href="/servicios" className="text-sm font-medium text-white/60 transition-colors hover:text-white">Servicios</Link>
                <span className="text-white/20">·</span>
                <Link href="/sobre-nosotros" className="text-sm font-medium text-white/60 transition-colors hover:text-white">Sobre nosotros</Link>
            </div>
        </div>
    );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function Contacto() {
    return (
        <>
            <Head title="Contacto - RA AUTOMOTRIZ | Taller mecánico en Chiclayo">
                <meta name="description"        content="Contacta con RA AUTOMOTRIZ en Chiclayo. Dirección: El Ayllu 267, La Victoria. Lunes a sábado 08:30–18:30. Formulario de contacto directo por WhatsApp." />
                <meta name="keywords"           content="contacto taller mecánico Chiclayo, dirección RA AUTOMOTRIZ, horario taller Chiclayo, WhatsApp mecánico Chiclayo, cómo llegar taller Chiclayo" />
                <meta name="author"             content="RA AUTOMOTRIZ" />
                <meta name="robots"             content="index, follow, max-snippet:-1, max-image-preview:large" />
                <meta name="geo.region"         content="PE-LAM" />
                <meta name="geo.placename"      content="Chiclayo, Lambayeque, Perú" />
                <link rel="canonical"           href="https://raautomotriz.com/contacto" />
                <meta property="og:type"        content="website" />
                <meta property="og:url"         content="https://raautomotriz.com/contacto" />
                <meta property="og:site_name"   content="RA AUTOMOTRIZ" />
                <meta property="og:locale"      content="es_PE" />
                <meta property="og:title"       content="Contacto – RA AUTOMOTRIZ | Taller en Chiclayo" />
                <meta property="og:description" content="El Ayllu 267, La Victoria, Chiclayo. Lun–Sáb 08:30–18:30. Escríbenos por WhatsApp o completa el formulario de contacto." />
                <meta property="og:image"       content="https://raautomotriz.com/ra/dise%C3%B1o/21.jpeg" />
                <meta property="og:image:alt"   content="Contacto RA AUTOMOTRIZ – Chiclayo" />
                <meta name="twitter:card"       content="summary_large_image" />
                <meta name="twitter:site"       content="@raautomotriz" />
                <meta name="twitter:title"      content="Contacto – RA AUTOMOTRIZ" />
                <meta name="twitter:description" content="El Ayllu 267, Chiclayo. Lun–Sáb 08:30–18:30. Respuesta por WhatsApp en menos de 30 minutos." />
                <meta name="twitter:image"      content="https://raautomotriz.com/ra/dise%C3%B1o/21.jpeg" />
                <link rel="preload"             href="/ra/dise%C3%B1o/21.jpeg" as="image" type="image/jpeg" fetchPriority="high" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: BREADCRUMB_LD }} />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                <WelcomeNavbar />
                <main id="main-content">
                    <Hero />
                    <InfoCards />
                    <ContactForm />
                    <MapSection />
                    <QuickNav />
                </main>
                <WelcomeFooter />
            </div>
            <SoraFAB />
            <ScrollToTopFAB />
        </>
    );
}
