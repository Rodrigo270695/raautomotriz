import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import WelcomeNavbar from '@/components/welcome/WelcomeNavbar';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import PageHero from '@/components/welcome/PageHero';
import { CONTACT } from '@/data/contact';
import { home } from '@/routes';

export default function Contacto() {
    return (
        <>
            <Head title="Contacto - RA AUTOMOTRIZ">
                <meta
                    name="description"
                    content="Contacta con RA AUTOMOTRIZ. Taller mecánico. Dirección, teléfono y horarios."
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <WelcomeNavbar />
                <PageHero
                    title="Contacto"
                    subtitle="Estamos para atenderte. Visítanos o escríbenos."
                />
                <main className="flex-1 flex flex-col pt-16 md:pt-24 pb-0" id="contacto">
                    <div className="mx-auto w-full max-w-2xl flex-shrink-0 px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="relative"
                            initial={{ y: 24, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ type: 'spring', stiffness: 70, damping: 22 }}
                        >
                            <div className="absolute left-0 top-0 h-full w-1 rounded-full bg-[#D9252A]/60 dark:bg-[#D9252A]/50" aria-hidden />
                            <div className="space-y-8 pl-8">
                                <div>
                                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1E2D4A]/70 dark:text-white/70">
                                        Dirección
                                    </h2>
                                    <a
                                        href={CONTACT.googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 block text-[#1E2D4A] dark:text-white underline-offset-4 hover:underline"
                                    >
                                        {CONTACT.address}
                                    </a>
                                </div>
                                <div>
                                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1E2D4A]/70 dark:text-white/70">
                                        Teléfono
                                    </h2>
                                    <p className="mt-2 text-[#1E2D4A] dark:text-white">
                                        {CONTACT.phone ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1E2D4A]/70 dark:text-white/70">
                                        Horario
                                    </h2>
                                    <p className="mt-2 text-[#1E2D4A] dark:text-white">
                                        {CONTACT.schedule}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.p
                            className="mt-12 text-center"
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

                    <motion.div
                        className="mt-16 w-full flex-shrink-0"
                        initial={{ y: 24, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ type: 'spring', stiffness: 70, damping: 22 }}
                    >
                        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1E2D4A]/70 dark:text-white/70 mb-4 px-4 sm:px-6 lg:px-8">
                            Cómo llegar
                        </h2>
                        <div className="w-full overflow-hidden border-t border-b border-[#1E2D4A]/10 dark:border-white/10">
                            <iframe
                                src={CONTACT.mapEmbedUrl}
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación de RA AUTOMOTRIZ"
                                className="block w-full"
                            />
                        </div>
                    </motion.div>
                </main>
                <WelcomeFooter />
            </div>
        </>
    );
}
