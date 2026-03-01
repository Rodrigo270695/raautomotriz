import { Head, Link } from '@inertiajs/react';
import WelcomeNavbar from '@/components/welcome/WelcomeNavbar';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import WelcomeHero from '@/components/welcome/WelcomeHero';

interface HeroProps {
    type: 'video' | 'image';
    video_url?: string | null;
    image_url?: string | null;
    title: string;
    subtitle: string;
}

export default function Welcome({ hero }: { canRegister?: boolean; hero?: HeroProps }) {
    const heroData = hero ?? {
        type: 'image' as const,
        video_url: null,
        image_url: null,
        title: 'RA AUTOMOTRIZ',
        subtitle:
            'Taller mecánico de confianza. Reparación, mantenimiento y diagnóstico profesional.',
    };

    return (
        <>
            <Head title="RA AUTOMOTRIZ - Taller mecánico | Reparación y mantenimiento">
                <meta
                    name="description"
                    content="RA AUTOMOTRIZ: taller mecánico especializado. Reparación de motores, frenos, suspensión, dirección, sistema eléctrico, scanner, planchado y pintura. Calidad y confianza."
                />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <WelcomeNavbar />
                <WelcomeHero
                    type={heroData.type}
                    videoUrl={heroData.video_url}
                    imageUrl={heroData.image_url}
                    title={heroData.title}
                    subtitle={heroData.subtitle}
                />
                <section
                    className="relative border-t border-[#1E2D4A]/10 bg-[#1E2D4A]/5 py-16 dark:border-white/10 dark:bg-white/5"
                    aria-label="Acciones principales"
                >
                    <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                        <p className="mb-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#1E2D4A]/60 dark:text-white/50">
                            Descubre más
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/servicios"
                                className="inline-flex items-center rounded-xl bg-[#D9252A] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#c21f24] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D9252A]/50 focus:ring-offset-2"
                            >
                                Ver servicios
                            </Link>
                                <Link
                                href="/sobre-nosotros"
                                className="inline-flex items-center rounded-xl border-2 border-[#1E2D4A]/15 bg-white px-6 py-3.5 text-sm font-semibold text-[#1E2D4A] transition-colors hover:border-[#1E2D4A]/25 hover:bg-[#1E2D4A]/5 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                            >
                                Sobre nosotros
                            </Link>
                            <Link
                                href="/contacto"
                                className="inline-flex items-center rounded-xl border-2 border-[#1E2D4A]/15 bg-white px-6 py-3.5 text-sm font-semibold text-[#1E2D4A] transition-colors hover:border-[#1E2D4A]/25 hover:bg-[#1E2D4A]/5 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                            >
                                Contacto
                            </Link>
                        </div>
                </div>
                </section>
                <WelcomeFooter />
            </div>
        </>
    );
}
