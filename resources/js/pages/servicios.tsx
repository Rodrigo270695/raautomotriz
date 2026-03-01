import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import WelcomeNavbar from '@/components/welcome/WelcomeNavbar';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import PageHero from '@/components/welcome/PageHero';
import { SERVICES } from '@/data/services';
import { home } from '@/routes';

const container = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: i * 0.03 },
    }),
};

const item = {
    hidden: { y: 24, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

export default function Servicios() {
    return (
        <>
            <Head title="Servicios - RA AUTOMOTRIZ">
                <meta
                    name="description"
                    content="Servicios de RA AUTOMOTRIZ: reparación de motores, frenos, suspensión, dirección, sistema eléctrico, scanner, planchado y pintura, alineamiento, GLP."
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <WelcomeNavbar />
                <PageHero
                    title="Nuestros servicios"
                    subtitle="Reparación, mantenimiento y diagnóstico para tu vehículo. Calidad y confianza en cada servicio."
                />
                <main className="flex-1 py-16 md:py-24">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        <motion.ul
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                            variants={container}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.08 }}
                            custom={0}
                        >
                            {SERVICES.map((s, index) => (
                                <motion.li
                                    key={s.slug}
                                    id={s.slug}
                                    variants={item}
                                    className="group scroll-mt-24"
                                >
                                    <Link
                                        href={`/servicios#${s.slug}`}
                                        className="flex flex-col border-b-2 border-[#1E2D4A]/10 pb-6 transition-colors hover:border-[#D9252A]/40 dark:border-white/10 dark:hover:border-[#D9252A]/50"
                                    >
                                        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#D9252A]">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <h2 className="text-lg font-semibold text-[#1E2D4A] dark:text-white">
                                            {s.label}
                                        </h2>
                                        <p className="mt-2 text-sm leading-relaxed text-[#1E2D4A]/75 dark:text-white/70">
                                            Servicio profesional con estándares de calidad. Consúltenos para más información.
                                        </p>
                                    </Link>
                                </motion.li>
                            ))}
                        </motion.ul>

                        <motion.p
                            className="mt-16 text-center"
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href={home()}
                                className="text-sm font-semibold text-[#D9252A] underline-offset-4 hover:underline"
                            >
                                Volver al inicio
                            </Link>
                        </motion.p>
                    </div>
                </main>
                <WelcomeFooter />
            </div>
        </>
    );
}
