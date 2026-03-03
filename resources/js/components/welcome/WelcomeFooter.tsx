import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import { CONTACT } from '@/data/contact';
import { SERVICES } from '@/data/services';
import { MapPin, Clock, MessageCircle } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const SOCIAL = [
    {
        label: 'Facebook',
        href: 'https://facebook.com/raautomotriz',
        icon: (
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
        ),
    },
    {
        label: 'Instagram',
        href: 'https://instagram.com/raautomotriz',
        icon: (
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
        ),
    },
    {
        label: 'TikTok',
        href: 'https://tiktok.com/@raautomotriz',
        icon: (
            <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
            </svg>
        ),
    },
    {
        label: 'WhatsApp',
        href: 'https://wa.me/51999999999?text=Hola%20RA%20AUTOMOTRIZ',
        icon: (
            <svg viewBox="0 0 32 32" className="size-4 fill-current" aria-hidden>
                <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.66 4.86 1.9 6.97L2 30l7.27-1.88A13.9 13.9 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm6.29 19.41c-.34-.17-2.03-1-2.35-1.12-.31-.11-.54-.17-.77.17-.23.34-.88 1.12-1.08 1.35-.2.23-.4.26-.74.09-.34-.17-1.44-.53-2.75-1.7-1.02-.9-1.7-2.02-1.9-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.05-2.55-.28-.67-.56-.58-.77-.59h-.66c-.23 0-.6.09-.91.43-.31.34-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.03-.83 2.32-1.63.29-.8.29-1.49.2-1.63-.09-.14-.31-.23-.66-.4z"/>
            </svg>
        ),
    },
];

const EMPRESA_LINKS = [
    { label: 'Inicio',          href: '/' },
    { label: 'Sobre nosotros',  href: '/sobre-nosotros' },
    { label: 'Servicios',       href: '/servicios' },
    { label: 'Contacto',        href: '/contacto' },
    { label: 'Iniciar sesión',  href: '/login' },
];

export default function WelcomeFooter() {
    return (
        <footer className="relative border-t border-[#1E2D4A]/20 bg-[#1E2D4A] text-white/90" role="contentinfo">
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#D9252A]/50 to-transparent" aria-hidden />

            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

                    {/* ── Marca ─────────────────────────────────────── */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href={home()} className="inline-flex rounded-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#1E2D4A]">
                            <img src="/logorasf.png" alt="RA AUTOMOTRIZ" className="h-10 w-auto object-contain brightness-0 invert" />
                        </Link>
                        <p className="mt-4 text-sm leading-relaxed text-white/65">
                            Taller mecánico especializado en Chiclayo. Más de 10 años de experiencia brindando calidad y confianza.
                        </p>

                        {/* Social links */}
                        <div className="mt-5 flex gap-2">
                            {SOCIAL.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-all hover:bg-white/20 hover:text-white hover:-translate-y-0.5"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Servicios ─────────────────────────────────── */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Servicios</h3>
                        <ul className="mt-4 space-y-2.5" role="list">
                            {SERVICES.map((s) => (
                                <li key={s.slug}>
                                    <Link href={`/servicios#${s.slug}`} className="text-sm text-white/70 transition-colors hover:text-white hover:underline underline-offset-2">
                                        {s.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Empresa ───────────────────────────────────── */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Empresa</h3>
                        <ul className="mt-4 space-y-2.5" role="list">
                            {EMPRESA_LINKS.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white hover:underline underline-offset-2">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Contacto ──────────────────────────────────── */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Contacto</h3>
                        <ul className="mt-4 space-y-4" role="list">
                            <li className="flex gap-3">
                                <MapPin className="mt-0.5 size-4 shrink-0 text-[#D9252A]" />
                                <a href={CONTACT.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 transition-colors hover:text-white hover:underline underline-offset-2">
                                    {CONTACT.address}
                                </a>
                            </li>
                            <li className="flex gap-3">
                                <Clock className="mt-0.5 size-4 shrink-0 text-[#D9252A]" />
                                <span className="text-sm text-white/70">Lun – Sáb · 08:00 – 18:00</span>
                            </li>
                            <li className="flex gap-3">
                                <MessageCircle className="mt-0.5 size-4 shrink-0 text-[#D9252A]" />
                                <a
                                    href="https://wa.me/51999999999?text=Hola%20RA%20AUTOMOTRIZ"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-white/70 transition-colors hover:text-white hover:underline underline-offset-2"
                                >
                                    Escríbenos por WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
                    <p className="text-xs text-white/45">
                        © {CURRENT_YEAR} RA AUTOMOTRIZ. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/privacidad" className="text-xs text-white/40 transition-colors hover:text-white/70">
                            Política de privacidad
                        </Link>
                        <Link href="/terminos" className="text-xs text-white/40 transition-colors hover:text-white/70">
                            Términos de uso
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
