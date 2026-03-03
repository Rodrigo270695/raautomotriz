import { Link } from '@inertiajs/react';
import { home } from '@/routes';

export default function RALogo() {
    return (
        <Link
            href={home()}
            className="flex items-center transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#D9252A]/30 focus:ring-offset-2 rounded-sm"
            aria-label="RA AUTOMOTRIZ - Inicio"
        >
            <img
                src="/logorasf.png"
                alt="RA AUTOMOTRIZ"
                className="h-10 w-auto sm:h-12 object-contain"
                draggable={false}
            />
        </Link>
    );
}
