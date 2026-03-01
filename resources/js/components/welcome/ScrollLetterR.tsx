import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Letra "R" (o "A") que baja con el scroll usando useScroll + useTransform.
 * Framer Motion ya incluye scroll-linked animations; no hace falta otra librería.
 */
export default function ScrollLetterR() {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 0.35, 0.7], [0, 120, 320]);

    return (
        <motion.span
            aria-hidden
            className="pointer-events-none fixed left-1/2 top-[18%] z-0 -translate-x-1/2 select-none"
            className="text-[#1E2D4A]/6 dark:text-white/5"
            style={{
                y,
                fontSize: 'clamp(6rem, 22vw, 18rem)',
                lineHeight: 0.85,
                fontFamily: 'inherit',
                fontWeight: 800,
                fontStyle: 'italic',
            }}
        >
            R
        </motion.span>
    );
}
