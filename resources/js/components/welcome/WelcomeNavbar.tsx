import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronDownIcon, LayoutDashboard, LogOut, Menu, UserCircle2, X } from 'lucide-react';
import { home, login, logout, register } from '@/routes';
import { index as dashboardRoute } from '@/routes/dashboard';
import { SERVICES } from '@/data/services';
import type { User } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/* ── Active path detection ──────────────────────────────────────────────── */
function useActivePath() {
    const page = usePage();
    const url  = page?.url ?? '';
    const pathname =
        typeof window !== 'undefined' && url
            ? new URL(url, window.location.origin).pathname
            : '/';
    return {
        isInicio:       pathname === '/',
        isSobreNosotros: pathname === '/sobre-nosotros',
        isServicios:    pathname.startsWith('/servicios'),
        isContacto:     pathname === '/contacto',
    };
}

/* ── Logo (switches tint based on navbar transparency) ─────────────────── */
function NavLogo({ scrolled }: { scrolled: boolean }) {
    return (
        <Link
            href={home()}
            className="flex items-center rounded-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="RA AUTOMOTRIZ - Inicio"
        >
            <img
                src="/logonav.png"
                alt="RA AUTOMOTRIZ"
                className={`h-10 w-auto object-contain transition-all duration-500 sm:h-12 ${scrolled ? '' : 'brightness-0 invert'}`}
                draggable={false}
            />
        </Link>
    );
}

/* ── Desktop dropdown ───────────────────────────────────────────────────── */
function ServicesDropdown({ open, scrolled }: { open: boolean; scrolled: boolean }) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    id="servicios-menu"
                    role="menu"
                    className="absolute left-0 top-full pt-2"
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1,    y: 0 }}
                    exit={{ opacity: 0, scale: 0.96,    y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{ transformOrigin: 'top left' }}
                >
                    <div className="min-w-[230px] overflow-hidden rounded-2xl border border-[#1E2D4A]/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#161d26]">
                        <Link
                            href="/servicios"
                            role="menuitem"
                            className="block border-b border-[#1E2D4A]/10 px-4 py-3 text-sm font-bold text-[#D9252A] transition-colors hover:bg-[#D9252A]/8 dark:border-white/10"
                        >
                            Ver todos los servicios →
                        </Link>
                        <div className="grid grid-cols-2 gap-0">
                            {SERVICES.map((s) => (
                                <Link
                                    key={s.slug}
                                    href={`/servicios#${s.slug}`}
                                    role="menuitem"
                                    className="block px-4 py-2.5 text-xs text-[#1E2D4A]/80 transition-colors hover:bg-[#D9252A]/8 hover:text-[#D9252A] dark:text-white/80 dark:hover:bg-white/8"
                                >
                                    {s.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ClientDesktopMenu({ user, scrolled }: { user: User; scrolled: boolean }) {
    const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();

    const nameClass = 'text-sm font-semibold text-[#1E2D4A] dark:text-white';
    const emailClass = 'text-[11px] text-[#1E2D4A]/70 dark:text-white/70';

    const handleLogout = () => {
        router.post(logout().url);
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-2 cursor-pointer rounded-full bg-[#D9252A] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#c21f24] hover:shadow"
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                        {initials || <UserCircle2 className="size-4" />}
                    </span>
                    <span className="flex items-center leading-tight">
                        <span className="text-sm font-semibold text-white">
                            {user.name}
                        </span>
                    </span>
                    <ChevronDownIcon className="size-3.5 text-white/80" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[220px]">
                <DropdownMenuLabel className="text-xs">
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-full bg-[#D9252A]/10 text-xs font-semibold text-[#D9252A]">
                            {initials || <UserCircle2 className="size-4" />}
                        </span>
                        <div className="flex flex-col">
                            <span className={nameClass}>{user.name}</span>
                            <span className={emailClass}>{user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={dashboardRoute().url} className="flex w-full cursor-pointer items-center">
                        <LayoutDashboard className="mr-2 size-4" />
                        Ir al panel
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault();
                        handleLogout();
                    }}
                    className="cursor-pointer text-red-600"
                >
                    <LogOut className="mr-2 size-4" />
                    Cerrar sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function WelcomeNavbar() {
    const { auth } = usePage().props as { auth: { user: User | null } };
    const { isInicio, isSobreNosotros, isServicios, isContacto } = useActivePath();

    const [scrolled,        setScrolled]        = useState(false);
    const [mobileOpen,      setMobileOpen]      = useState(false);
    const [desktopSvcOpen,  setDesktopSvcOpen]  = useState(false);
    const [mobileSvcOpen,   setMobileSvcOpen]   = useState(false);

    /* Detect scroll -------------------------------------------------------- */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        onScroll(); // run once on mount
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* Close mobile menu on resize ----------------------------------------- */
    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    /* Dynamic classes based on scroll ------------------------------------- */
    const navBg   = scrolled
        ? 'bg-white/95 border-b border-[#1E2D4A]/10 shadow-sm backdrop-blur-md dark:bg-[#0a0a0a]/95 dark:border-white/10'
        : 'bg-transparent border-b border-transparent';

    const linkBase = 'group relative rounded-md px-3 py-2 text-sm font-medium transition-all duration-300';

    const linkActive   = scrolled
        ? 'text-[#D9252A] font-semibold'
        : 'text-white font-semibold';

    const linkInactive = scrolled
        ? 'text-[#1E2D4A]/80 hover:text-[#D9252A] dark:text-white/80 dark:hover:text-white'
        : 'text-white/85 hover:text-white';

    const underlineCls = 'absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#D9252A] origin-center transition-transform duration-200';

    const user = auth.user;
    const isCliente = !!user?.roles?.some((r) => r.name === 'cliente');

    return (
        <>
        {/* Skip-to-content – visible only on keyboard focus */}
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-200 focus:rounded-xl focus:bg-[#D9252A] focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg focus:outline-none"
        >
            Ir al contenido principal
        </a>

        <header
            className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-400 ${navBg}`}
            role="banner"
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <NavLogo scrolled={scrolled} />

                {/* Desktop nav */}
                <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">

                    <Link href={home()} className={`${linkBase} ${isInicio ? linkActive : linkInactive}`} aria-current={isInicio ? 'page' : undefined}>
                        <span className="relative z-10">Inicio</span>
                        <span className={`${underlineCls} ${isInicio ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} aria-hidden />
                    </Link>

                    <Link href="/sobre-nosotros" className={`${linkBase} ${isSobreNosotros ? linkActive : linkInactive}`} aria-current={isSobreNosotros ? 'page' : undefined}>
                        <span className="relative z-10">Sobre nosotros</span>
                        <span className={`${underlineCls} ${isSobreNosotros ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} aria-hidden />
                    </Link>

                    {/* Servicios dropdown */}
                    <div
                        className="relative"
                        onMouseEnter={() => setDesktopSvcOpen(true)}
                        onMouseLeave={() => setDesktopSvcOpen(false)}
                    >
                        <button
                            type="button"
                            className={`flex items-center gap-1 ${linkBase} ${isServicios ? linkActive : linkInactive}`}
                            aria-expanded={desktopSvcOpen}
                            aria-haspopup="true"
                            aria-controls="servicios-menu"
                        >
                            <span className="relative z-10 flex items-center gap-1">
                                Servicios
                                <ChevronDown className={`size-3.5 transition-transform duration-200 ${desktopSvcOpen ? 'rotate-180' : ''}`} />
                            </span>
                            <span className={`${underlineCls} ${isServicios ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} aria-hidden />
                        </button>
                        <ServicesDropdown open={desktopSvcOpen} scrolled={scrolled} />
                    </div>

                    <Link href="/contacto" className={`${linkBase} ${isContacto ? linkActive : linkInactive}`} aria-current={isContacto ? 'page' : undefined}>
                        <span className="relative z-10">Contacto</span>
                        <span className={`${underlineCls} ${isContacto ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} aria-hidden />
                    </Link>
                </nav>

                {/* Auth — desktop */}
                <div className="hidden items-center gap-2 md:flex">
                    {user ? (
                        isCliente ? (
                            <ClientDesktopMenu user={user} scrolled={scrolled} />
                        ) : (
                            <Link
                                href={dashboardRoute().url}
                                className="rounded-lg bg-[#D9252A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#c21f24] hover:shadow"
                            >
                                Panel
                            </Link>
                        )
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${scrolled ? 'text-[#1E2D4A] hover:text-[#D9252A] dark:text-white/90' : 'text-white/85 hover:text-white'}`}
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                href={register()}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:-translate-y-px ${scrolled ? 'bg-[#1E2D4A] text-white hover:bg-[#2a3d5c]' : 'bg-white text-[#1E2D4A] hover:bg-white/90'}`}
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    type="button"
                    className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors md:hidden ${scrolled ? 'text-[#1E2D4A] hover:bg-[#1E2D4A]/10 dark:text-white dark:hover:bg-white/10' : 'text-white hover:bg-white/10'}`}
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-menu"
                    onClick={() => setMobileOpen((o) => !o)}
                >
                    <span className="sr-only">{mobileOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
                    <motion.div
                        key={mobileOpen ? 'x' : 'menu'}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.18 }}
                    >
                        {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </motion.div>
                </button>
            </div>

            {/* Mobile menu — animated slide down */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        id="mobile-menu"
                        className="overflow-hidden border-t border-[#1E2D4A]/10 bg-white dark:border-white/10 dark:bg-[#0f1419] md:hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                    >
                        <nav className="flex flex-col gap-0.5 px-4 py-3" aria-label="Navegación móvil">

                            <Link href={home()} className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#1E2D4A]/5 ${isInicio ? 'text-[#D9252A] font-semibold' : 'text-[#1E2D4A] dark:text-white'}`} onClick={() => setMobileOpen(false)} aria-current={isInicio ? 'page' : undefined}>
                                Inicio
                            </Link>

                            <Link href="/sobre-nosotros" className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#1E2D4A]/5 ${isSobreNosotros ? 'text-[#D9252A] font-semibold' : 'text-[#1E2D4A] dark:text-white'}`} onClick={() => setMobileOpen(false)} aria-current={isSobreNosotros ? 'page' : undefined}>
                                Sobre nosotros
                            </Link>

                            {/* Servicios accordion mobile */}
                            <div>
                                <button
                                    type="button"
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#1E2D4A]/5 ${isServicios ? 'text-[#D9252A] font-semibold' : 'text-[#1E2D4A] dark:text-white'}`}
                                    onClick={() => setMobileSvcOpen((o) => !o)}
                                    aria-expanded={mobileSvcOpen}
                                >
                                    Servicios
                                    <ChevronDown className={`size-4 transition-transform duration-200 ${mobileSvcOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {mobileSvcOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.22 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-[#D9252A]/25 pl-3 pb-1">
                                                <Link href="/servicios" className="rounded-lg px-2 py-2 text-sm font-semibold text-[#D9252A]" onClick={() => setMobileOpen(false)}>
                                                    Ver todos →
                                                </Link>
                                                {SERVICES.map((s) => (
                                                    <Link key={s.slug} href={`/servicios#${s.slug}`} className="rounded-lg px-2 py-2 text-xs text-[#1E2D4A]/80 transition-colors hover:text-[#D9252A] dark:text-white/75" onClick={() => setMobileOpen(false)}>
                                                        {s.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Link href="/contacto" className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#1E2D4A]/5 ${isContacto ? 'text-[#D9252A] font-semibold' : 'text-[#1E2D4A] dark:text-white'}`} onClick={() => setMobileOpen(false)} aria-current={isContacto ? 'page' : undefined}>
                                Contacto
                            </Link>

                            {/* Auth mobile */}
                            <div className="mt-2 flex flex-col gap-2 border-t border-[#1E2D4A]/10 pt-3 dark:border-white/10">
                                {user ? (
                                    isCliente ? (
                                        <>
                                            <div className="flex flex-col items-start gap-0.5 rounded-xl bg-[#1E2D4A]/5 px-3 py-2">
                                                <span className="text-xs font-semibold text-[#1E2D4A] dark:text-white">
                                                    {user.name}
                                                </span>
                                                <span className="text-[11px] text-[#1E2D4A]/70 dark:text-white/70">
                                                    {user.email}
                                                </span>
                                            </div>
                                            <Link
                                                href={dashboardRoute().url}
                                                className="rounded-xl bg-[#D9252A] px-4 py-2.5 text-center text-sm font-semibold text-white"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                Ir al panel
                                            </Link>
                                            <Link
                                                href={logout()}
                                                as="button"
                                                method="post"
                                                className="rounded-xl border border-[#1E2D4A]/20 px-4 py-2.5 text-center text-sm font-medium text-[#1E2D4A] dark:border-white/20 dark:text-white"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                Cerrar sesión
                                            </Link>
                                        </>
                                    ) : (
                                        <Link
                                            href={dashboardRoute().url}
                                            className="rounded-xl bg-[#D9252A] px-4 py-2.5 text-center text-sm font-semibold text-white"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Panel
                                        </Link>
                                    )
                                ) : (
                                    <>
                                        <Link href={login()} className="rounded-xl border border-[#1E2D4A]/20 px-4 py-2.5 text-center text-sm font-medium text-[#1E2D4A] dark:border-white/20 dark:text-white" onClick={() => setMobileOpen(false)}>
                                            Iniciar sesión
                                        </Link>
                                        <Link href={register()} className="rounded-xl bg-[#1E2D4A] px-4 py-2.5 text-center text-sm font-semibold text-white" onClick={() => setMobileOpen(false)}>
                                            Registrarse
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
        </>
    );
}
