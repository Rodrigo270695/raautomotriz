import { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Clock } from 'lucide-react';
import { CONTACT } from '@/data/contact';

export default function CtaSection() {
    const ref    = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section className="relative overflow-hidden bg-[#1E2D4A] py-20" aria-label="Contáctanos">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[#D9252A]/15 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-white/5 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 28 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.55 }}
                >
                    <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#D9252A]">
                        ¿Listo para empezar?
                    </span>
                    <h2 className="mb-5 text-3xl font-extrabold text-white sm:text-4xl">
                        Tu vehículo en las mejores manos
                    </h2>
                    <p className="mb-10 text-base text-white/65">
                        Visítanos en <strong className="text-white/90">{CONTACT.address}</strong>.<br />
                        Atendemos de lunes a sábado. Sin citas previas.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a
                            href={CONTACT.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#D9252A] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#D9252A]/25 transition-all hover:bg-[#c21f24] hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            <MapPin className="size-4" /> Cómo llegar
                        </a>
                        <Link
                            href="/contacto"
                            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/50 hover:-translate-y-0.5"
                        >
                            <Phone className="size-4" /> Contacto
                        </Link>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
                        <span className="flex items-center gap-2"><Clock className="size-4 text-[#D9252A]" /> Lun – Sáb 08:30 – 18:30</span>
                        <span className="flex items-center gap-2"><MapPin className="size-4 text-[#D9252A]" /> La Victoria, Chiclayo</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
