/**
 * Hero de Inicio: soporta video de fondo o imagen.
 * Sin media: mismo lenguaje visual que Sobre nosotros (gradiente, patrón, alma).
 * Con media: overlay sobre video/imagen.
 */
import { motion } from 'framer-motion';

interface WelcomeHeroProps {
    type: 'video' | 'image';
    videoUrl?: string | null;
    imageUrl?: string | null;
    title: string;
    subtitle: string;
}

const spring = { type: 'spring' as const, stiffness: 80, damping: 18 };
const springSlow = { type: 'spring' as const, stiffness: 50, damping: 20 };

export default function WelcomeHero({
    type,
    videoUrl,
    imageUrl,
    title,
    subtitle,
}: WelcomeHeroProps) {
    const hasVideo = type === 'video' && videoUrl;
    const hasImage = type === 'image' && imageUrl;
    const useMedia = hasVideo || hasImage;

    if (!useMedia) {
        return (
            <header
                className="relative overflow-hidden border-b border-[#1E2D4A]/15 dark:border-white/10"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 85% 70% at 50% 45%, rgba(255,255,255,0.18) 0%, transparent 55%),
                        radial-gradient(circle at 88% 12%, rgba(217,37,42,0.08) 0%, transparent 38%),
                        radial-gradient(circle at 12% 88%, rgba(217,37,42,0.05) 0%, transparent 30%),
                        radial-gradient(circle, rgba(30,45,74,0.2) 1.5px, transparent 1.5px),
                        linear-gradient(180deg, rgba(30,45,74,0.48) 0%, rgba(30,45,74,0.28) 50%, rgba(30,45,74,0.14) 100%)
                    `,
                    backgroundSize: '100% 100%, 100% 100%, 100% 100%, 26px 26px, 100% 100%',
                }}
            >
                <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 md:py-28 lg:py-36">
                    <div className="flex items-baseline justify-center gap-0">
                        <motion.span
                            className="inline-block font-extrabold italic tracking-tight text-[#D9252A]"
                            style={{
                                fontSize: 'clamp(3.5rem, 14vw, 9rem)',
                                lineHeight: 0.9,
                                textShadow: '0 2px 20px rgba(217,37,42,0.25), 0 0 40px rgba(217,37,42,0.08)',
                            }}
                            initial={{ x: -120, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ ...spring, delay: 0.15 }}
                        >
                            RA
                        </motion.span>
                    </div>
                    <motion.span
                        className="mt-2 block text-sm font-bold uppercase tracking-[0.35em] text-[#1E2D4A]/90 dark:text-white/90 md:text-base"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...springSlow, delay: 0.4 }}
                    >
                        AUTOMOTRIZ
                    </motion.span>
                    <motion.p
                        className="mt-8 max-w-xl text-center text-base leading-relaxed text-[#1E2D4A]/90 dark:text-white/85 md:mt-10 md:text-lg"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ ...springSlow, delay: 0.55 }}
                    >
                        {subtitle}
                    </motion.p>
                </div>
            </header>
        );
    }

    return (
        <header className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-[#1E2D4A]">
            {hasVideo && (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-hidden
                >
                    <source src={videoUrl!} type="video/mp4" />
                </video>
            )}
            {hasImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                    aria-hidden
                />
            )}
            <div className="absolute inset-0 bg-[#1E2D4A]/75" aria-hidden />
            <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl">
                    {title}
                </h1>
                <p className="text-lg text-white/90 drop-shadow sm:text-xl md:text-2xl">{subtitle}</p>
            </div>
            <div
                className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[#FDFDFC] to-transparent dark:from-[#0a0a0a]"
                aria-hidden
            />
        </header>
    );
}
