import { motion } from 'framer-motion';

interface PageHeroProps {
    title: string;
    subtitle: string;
}

/**
 * Hero corto para páginas interiores (Servicios, Contacto). Mismo lenguaje visual que Sobre nosotros.
 */
export default function PageHero({ title, subtitle }: PageHeroProps) {
    return (
        <header
            className="relative overflow-hidden border-b border-[#1E2D4A]/15 dark:border-white/10"
            style={{
                backgroundImage: `
                    radial-gradient(ellipse 85% 70% at 50% 50%, rgba(255,255,255,0.14) 0%, transparent 55%),
                    radial-gradient(circle, rgba(30,45,74,0.16) 1.5px, transparent 1.5px),
                    linear-gradient(180deg, rgba(30,45,74,0.35) 0%, rgba(30,45,74,0.18) 70%, rgba(30,45,74,0.08) 100%)
                `,
                backgroundSize: '100% 100%, 24px 24px, 100% 100%',
            }}
        >
            <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-20 lg:px-8">
                <motion.p
                    className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#D9252A]"
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    RA AUTOMOTRIZ
                </motion.p>
                <motion.h1
                    className="text-3xl font-bold tracking-tight text-[#1E2D4A] dark:text-white md:text-4xl lg:text-5xl"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                >
                    {title}
                </motion.h1>
                <motion.p
                    className="mt-4 text-base text-[#1E2D4A]/85 dark:text-white/80 md:text-lg"
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.14 }}
                >
                    {subtitle}
                </motion.p>
            </div>
        </header>
    );
}
