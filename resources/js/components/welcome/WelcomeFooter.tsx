import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import { CONTACT } from '@/data/contact';
import { SERVICES } from '@/data/services';

const CURRENT_YEAR = new Date().getFullYear();

export default function WelcomeFooter() {
    return (
        <footer
            className="relative border-t border-[#1E2D4A]/20 bg-[#1E2D4A] text-white/90 dark:border-white/10"
            role="contentinfo"
        >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D9252A]/40 to-transparent" aria-hidden />
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Marca */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#1E2D4A] rounded-sm"
                        >
                            <span className="text-xl font-extrabold italic text-white">
                                RA
                            </span>
                            <span className="text-[10px] font-bold italic uppercase tracking-[0.2em] text-white/80">
                                AUTOMOTRIZ
                            </span>
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                            Taller mecánico especializado. Reparación, mantenimiento y diagnóstico para tu vehículo.
                        </p>
                    </div>

                    {/* Servicios */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                            Servicios
                        </h3>
                        <ul className="mt-4 space-y-2.5" role="list">
                            {SERVICES.map((s) => (
                                <li key={s.slug}>
                                    <Link
                                        href={`/servicios#${s.slug}`}
                                        className="text-sm text-white/75 transition-colors hover:text-white hover:underline underline-offset-2"
                                    >
                                        {s.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                            Contacto
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-white/75" role="list">
                            <li>
                                <Link
                                    href="/contacto"
                                    className="transition-colors hover:text-white hover:underline underline-offset-2"
                                >
                                    Ver información de contacto
                                </Link>
                            </li>
                            <li>
                                <span className="block font-medium text-white/90">Dirección</span>
                                <a
                                    href={CONTACT.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-white/75 transition-colors hover:text-white hover:underline underline-offset-2"
                                >
                                    {CONTACT.address}
                                </a>
                            </li>
                            {CONTACT.phone && (
                                <li>
                                    <span className="block font-medium text-white/90">Teléfono</span>
                                    <a href={`tel:${CONTACT.phone}`} className="block text-white/75 hover:text-white hover:underline underline-offset-2">
                                        {CONTACT.phone}
                                    </a>
                                </li>
                            )}
                            <li>
                                <span className="block font-medium text-white/90">Horario</span>
                                <span className="block text-white/75">{CONTACT.schedule}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 border-t border-white/10 pt-8">
                    <p className="text-center text-sm text-white/60 sm:text-left">
                        © {CURRENT_YEAR} RA AUTOMOTRIZ. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
