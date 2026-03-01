import { Link } from '@inertiajs/react';
import { home } from '@/routes';

export default function RALogo() {
    return (
        <Link
            href={home()}
            className="flex items-center gap-2 transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#D9252A]/30 focus:ring-offset-2 rounded-sm"
            aria-label="RA AUTOMOTRIZ - Inicio"
        >
            <span className="flex items-baseline gap-0.5">
                <span
                    className="font-extrabold italic text-[1.5rem] sm:text-2xl tracking-tight leading-none"
                    style={{ color: '#D9252A' }}
                >
                    RA
                </span>
                <CarIcon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            </span>
            <span
                className="text-[10px] sm:text-xs font-bold italic uppercase tracking-[0.2em] leading-none hidden sm:block"
                style={{ color: '#1E2D4A' }}
            >
                AUTOMOTRIZ
            </span>
        </Link>
    );
}

function CarIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            style={{ color: '#1E2D4A' }}
            aria-hidden
        >
            <path d="M18 9l-1.5-4.5H7.5L6 9H4v2h1v8h2v-2h10v2h2v-8h1V9h-2zm-2.5 2a1 1 0 110-2 1 1 0 010 2zm-7 0a1 1 0 110-2 1 1 0 010 2zM6 10l1-3h10l1 3H6z" />
        </svg>
    );
}
