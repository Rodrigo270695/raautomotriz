import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { home, login, register } from '@/routes';
import { index as dashboardRoute } from '@/routes/dashboard';
import RALogo from './ra-logo';
import { SERVICES } from '@/data/services';

const BASE_LINK =
    'group relative rounded-md px-3 py-2 text-sm font-medium transition-colors';
const ACTIVE_LINK =
    'text-[#D9252A] font-semibold dark:text-[#f87171]';
const INACTIVE_LINK =
    'text-[#1E2D4A] hover:text-[#D9252A] dark:text-white/90 dark:hover:text-white';
/** Línea que se expande bajo el enlace (hover + activo) */
const UNDERLINE_BASE =
    'absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#D9252A] transition-transform duration-200 origin-center';
const UNDERLINE_HIDDEN = 'scale-x-0 group-hover:scale-x-100';
const UNDERLINE_VISIBLE = 'scale-x-100';

function useActivePath() {
    const page = usePage();
    const url = page?.url ?? '';
    const pathname =
        typeof window !== 'undefined' && url
            ? new URL(url, window.location.origin).pathname
            : '/';

    return {
        isInicio: pathname === '/',
        isSobreNosotros: pathname === '/sobre-nosotros',
        isServicios: pathname === '/servicios',
        isContacto: pathname === '/contacto',
    };
}

export default function WelcomeNavbar() {
    const { auth } = usePage().props;
    const { isInicio, isSobreNosotros, isServicios, isContacto } = useActivePath();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);

    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-[#1E2D4A]/10 bg-white/90 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-white/80 dark:border-white/10 dark:bg-[#0a0a0a]/95 dark:shadow-black/10"
            role="banner"
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <RALogo />

                {/* Desktop nav */}
                <nav
                    className="hidden items-center gap-1 md:flex"
                    aria-label="Navegación principal"
                >
                    <Link
                        href={home()}
                        className={`${BASE_LINK} ${isInicio ? ACTIVE_LINK : INACTIVE_LINK}`}
                        aria-current={isInicio ? 'page' : undefined}
                    >
                        <span className="relative z-10">Inicio</span>
                        <span
                            className={`${UNDERLINE_BASE} ${isInicio ? UNDERLINE_VISIBLE : UNDERLINE_HIDDEN}`}
                            aria-hidden
                        />
                    </Link>
                    <Link
                        href="/sobre-nosotros"
                        className={`${BASE_LINK} ${isSobreNosotros ? ACTIVE_LINK : INACTIVE_LINK}`}
                        aria-current={isSobreNosotros ? 'page' : undefined}
                    >
                        <span className="relative z-10">Sobre nosotros</span>
                        <span
                            className={`${UNDERLINE_BASE} ${isSobreNosotros ? UNDERLINE_VISIBLE : UNDERLINE_HIDDEN}`}
                            aria-hidden
                        />
                    </Link>

                    {/* Servicios dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setServicesOpen(true)}
                        onMouseLeave={() => setServicesOpen(false)}
                    >
                        <button
                            type="button"
                            className={`flex items-center gap-1 ${BASE_LINK} ${isServicios ? ACTIVE_LINK : INACTIVE_LINK}`}
                            aria-expanded={servicesOpen}
                            aria-haspopup="true"
                            aria-controls="servicios-menu"
                            aria-current={isServicios ? 'true' : undefined}
                        >
                            <span className="relative z-10 flex items-center gap-1">
                                Servicios
                                <svg
                                    className={`h-4 w-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                            <span
                                className={`${UNDERLINE_BASE} ${isServicios ? UNDERLINE_VISIBLE : UNDERLINE_HIDDEN}`}
                                aria-hidden
                            />
                        </button>
                        <div
                            id="servicios-menu"
                            role="menu"
                            className={`absolute left-0 top-full pt-1 ${servicesOpen ? 'opacity-100 visible' : 'invisible opacity-0'} transition-all duration-200`}
                        >
                            <div className="min-w-[220px] rounded-xl border border-[#1E2D4A]/10 bg-white py-2 shadow-lg dark:border-white/10 dark:bg-[#161d26]">
                                <Link
                                    href="/servicios"
                                    role="menuitem"
                                    className="block border-b border-[#1E2D4A]/10 px-4 py-2.5 text-sm font-medium text-[#D9252A] transition-colors hover:bg-[#D9252A]/10 dark:border-white/10 dark:hover:bg-white/10"
                                >
                                    Ver todos los servicios
                                </Link>
                                {SERVICES.map((s) => (
                                    <Link
                                        key={s.slug}
                                        href={`/servicios#${s.slug}`}
                                        role="menuitem"
                                        className="block px-4 py-2.5 text-sm text-[#1E2D4A] transition-colors hover:bg-[#D9252A]/10 hover:text-[#D9252A] dark:text-white/90 dark:hover:bg-white/10"
                                    >
                                        {s.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/contacto"
                        className={`${BASE_LINK} ${isContacto ? ACTIVE_LINK : INACTIVE_LINK}`}
                        aria-current={isContacto ? 'page' : undefined}
                    >
                        <span className="relative z-10">Contacto</span>
                        <span
                            className={`${UNDERLINE_BASE} ${isContacto ? UNDERLINE_VISIBLE : UNDERLINE_HIDDEN}`}
                            aria-hidden
                        />
                    </Link>
                </nav>

                {/* Auth links — desktop */}
                <div className="hidden items-center gap-2 md:flex">
                    {auth.user ? (
                        <Link
                            href={dashboardRoute().url}
                            className="rounded-lg bg-[#D9252A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#c21f24] hover:shadow focus:outline-none focus:ring-2 focus:ring-[#D9252A]/50 focus:ring-offset-2"
                        >
                            Panel
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-[#1E2D4A] transition-colors hover:text-[#D9252A] dark:text-white/90"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                href={register()}
                                className="rounded-lg bg-[#1E2D4A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2a3d5c] focus:outline-none focus:ring-2 focus:ring-[#1E2D4A]/50 focus:ring-offset-2"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg p-2 text-[#1E2D4A] transition-colors hover:bg-[#1E2D4A]/10 dark:text-white dark:hover:bg-white/10 md:hidden"
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-menu"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <span className="sr-only">{mobileOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
                    {mobileOpen ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile menu: inert cuando está cerrado para que los enlaces no reciban foco (evita el warning de aria-hidden) */}
            <div
                id="mobile-menu"
                className={`border-t border-[#1E2D4A]/10 bg-white dark:border-white/10 dark:bg-[#0f1419] md:hidden ${mobileOpen ? 'block' : 'hidden'}`}
                aria-hidden={!mobileOpen}
                {...(!mobileOpen && { inert: true })}
            >
                <nav className="flex flex-col gap-0 px-4 py-4" aria-label="Navegación móvil">
                    <Link
                        href={home()}
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isInicio ? ACTIVE_LINK : 'text-[#1E2D4A] dark:text-white'}`}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isInicio ? 'page' : undefined}
                    >
                        Inicio
                    </Link>
                    <Link
                        href="/sobre-nosotros"
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isSobreNosotros ? ACTIVE_LINK : 'text-[#1E2D4A] dark:text-white'}`}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isSobreNosotros ? 'page' : undefined}
                    >
                        Sobre nosotros
                    </Link>
                    <div className="py-1">
                        <button
                            type="button"
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${isServicios ? ACTIVE_LINK : 'text-[#1E2D4A] dark:text-white'}`}
                            onClick={() => setServicesOpen(!servicesOpen)}
                            aria-current={isServicios ? 'true' : undefined}
                        >
                            Servicios
                            <svg
                                className={`h-4 w-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {servicesOpen && (
                            <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-[#D9252A]/30 pl-3">
                                {SERVICES.map((s) => (
                                    <Link
                                        key={s.slug}
                                        href={`/servicios#${s.slug}`}
                                        className="rounded-lg px-2 py-2 text-sm text-[#1E2D4A]/90 dark:text-white/80"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {s.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    <Link
                        href="/contacto"
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isContacto ? ACTIVE_LINK : 'text-[#1E2D4A] dark:text-white'}`}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isContacto ? 'page' : undefined}
                    >
                        Contacto
                    </Link>
                    <div className="mt-2 flex flex-col gap-2 border-t border-[#1E2D4A]/10 pt-4 dark:border-white/10">
                        {auth.user ? (
                            <Link
                                href={dashboardRoute().url}
                                className="rounded-lg bg-[#D9252A] px-4 py-2.5 text-center text-sm font-semibold text-white"
                                onClick={() => setMobileOpen(false)}
                            >
                                Panel
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-lg border border-[#1E2D4A]/20 px-4 py-2.5 text-center text-sm font-medium text-[#1E2D4A] dark:border-white/20 dark:text-white"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-lg bg-[#1E2D4A] px-4 py-2.5 text-center text-sm font-semibold text-white"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
