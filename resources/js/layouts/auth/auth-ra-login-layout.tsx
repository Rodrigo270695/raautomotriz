import { Link } from '@inertiajs/react';
import { home } from '@/routes';

type AuthRALoginLayoutProps = {
    children: React.ReactNode;
    title: string;
    description: string;
    /** Si es true, el card es más ancho y con más padding (solo registro). Login/recuperar quedan con card pequeño. */
    wideCard?: boolean;
};

/** Paleta del logo: rojo + azul marino (sin negro). Acorde al sidebar (intensidad suave). */
const raColors = {
    navy: '#0f172a',       // azul marino oscuro (fondo)
    navyMid: '#1e293b',    // azul marino medio
    navyCard: '#2d4a6f',  // card elevada (mismo tono que sidebar activo)
    border: '#334155',     // borde suave
    brandRed: '#e12a2d',
    brandRedHover: '#c92427',
    text: '#f8fafc',
    textMuted: '#94a3b8',
};

export default function AuthRALoginLayout({
    children,
    title,
    description,
    wideCard = false,
}: AuthRALoginLayoutProps) {
    return (
        <div
            className="relative flex min-h-dvh flex-col items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-6 sm:py-8 md:px-8 md:py-10"
            style={{
                background: `linear-gradient(165deg, ${raColors.navy} 0%, ${raColors.navyMid} 50%, #0d1520 100%)`,
            }}
        >
            {/* Patrón sutil para profundidad */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(${raColors.border} 1px, transparent 1px),
                                     linear-gradient(90deg, ${raColors.border} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <div
                className={`relative z-10 w-full ${wideCard ? 'max-w-[480px] sm:max-w-[580px] md:max-w-[680px]' : 'max-w-[400px] sm:max-w-[420px]'}`}
            >
                <div className="flex min-h-0 flex-col gap-4 sm:gap-6 md:gap-8">
                    {/* Logo + branding */}
                    <div className="flex shrink-0 flex-col items-center gap-3 sm:gap-4 md:gap-6">
                        <Link
                            href={home()}
                            className="rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#e12a2d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]"
                            aria-label="RA Automotriz - Inicio"
                        >
                            <img
                                src="/logorasf.png"
                                alt="RA Automotriz - Taller especializado"
                                className="h-auto w-full max-w-[180px] sm:max-w-[240px] md:max-w-[260px]"
                                width={260}
                                height={80}
                                fetchPriority="high"
                                style={{
                                    filter: [
                                        'drop-shadow(0 0 1px rgba(255,255,255,0.85))',
                                        'drop-shadow(0 0 2px rgba(255,255,255,0.5))',
                                        'drop-shadow(0 0 3px rgba(255,255,255,0.25))',
                                    ].join(' '),
                                }}
                            />
                        </Link>
                        <div className="space-y-0.5 text-center sm:space-y-1">
                            <h1
                                className="text-base font-semibold leading-tight tracking-tight text-[#f8fafc] sm:text-xl md:text-2xl"
                            >
                                {title}
                            </h1>
                            <p className="text-xs leading-snug text-[#94a3b8] sm:text-sm md:text-base">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Card del formulario */}
                    <div
                        className={`rounded-2xl border border-[#334155]/60 shadow-xl sm:rounded-2xl ${wideCard ? 'px-6 py-7 sm:px-8 sm:py-9 md:px-10 md:py-10' : 'px-4 py-5 sm:px-7 sm:py-8 md:px-8 md:py-9'}`}
                        style={{
                            backgroundColor: 'rgba(45, 74, 111, 0.6)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(51, 65, 85, 0.2)',
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export { raColors };
